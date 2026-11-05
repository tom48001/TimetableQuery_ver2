// One worker process owns all running imports. Cancellation is cooperative:
// finish the current SQL statement, then roll back before executing more work.
export const activeImports = new Map();

export async function acquireImportConnection(req, pool) {
  const connection = await pool.getConnection();
  try {
    // Metadata locks (ALTER/CREATE) otherwise default to a very long wait.
    // Set before any schema check, not only after starting the transaction.
    await connection.query('SET SESSION lock_wait_timeout = 15, innodb_lock_wait_timeout = 15');
    checkImportCancellation(req);
    return cancellableConnection(req, connection);
  } catch (error) {
    connection.release();
    throw error;
  }
}

export function checkImportCancellation(req) {
  if (req.importControl?.cancelled) {
    const error = new Error('匯入已取消。Import cancelled.');
    error.code = 'IMPORT_CANCELLED';
    throw error;
  }
}

export function cancellableConnection(req, connection) {
  if (!req.importControl) return connection;
  return new Proxy(connection, {
    get(target, key) {
      if (key === 'query' || key === 'execute') return async (...args) => {
        // Named locks must always be released, including after cancellation.
        if (!/RELEASE_LOCK\s*\(/i.test(String(args[0]))) checkImportCancellation(req);
        try {
          return await target[key](...args);
        } catch (error) {
          checkImportCancellation(req);
          throw error;
        }
      };
      if (key === 'beginTransaction') return (...args) => {
        checkImportCancellation(req);
        return target.beginTransaction(...args);
      };
      if (key === 'commit') return (...args) => {
        checkImportCancellation(req);
        req.importControl.committing = true;
        return target.commit(...args);
      };
      const value = target[key];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}

export function cancelOwnImports(req, res) {
  let requested = 0;
  let committing = 0;
  for (const [jobId, control] of activeImports) {
    if (String(control.ownerId) !== String(req.user.id)) continue;
    if (req.body.jobId && req.body.jobId !== jobId) continue;
    if (control.committing) { committing++; continue; }
    control.cancelled = true;
    requested++;
  }
  return res.json({ requested, committing, message: requested
    ? '已要求取消，正等待目前操作結束及回復交易。Cancellation requested; waiting for rollback.'
    : '沒有可取消的工作，或工作已開始提交。No cancellable job; it may already be committing or finished.' });
}
