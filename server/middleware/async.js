// Express 4 does not catch rejected promises from async handlers: one failing
// query would take the whole API down in the middle of an exam. Every route
// in this project is async, so the routers wrap their handlers once here and
// let the error middleware answer with a 500 instead of crashing.
//
// The routers call this at the end of the file, after their routes are already
// registered. Only patching the router's methods would therefore protect
// nothing: the handlers that need the protection are already in place. So the
// registered handlers are wrapped here as well.
export function wrapRouter(router) {
  const wrap = (handler) => {
    const wrapped = (req, res, next) => {
      try {
        Promise.resolve(handler(req, res, next)).catch(next);
      } catch (err) {
        next(err);
      }
    };
    wrapped.__wrapped = true;
    return wrapped;
  };

  // Handlers registered from here on.
  for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => original(path, ...handlers.map(wrap));
  }

  // Handlers that are already registered. An error handler takes four
  // arguments and is left alone.
  for (const layer of router.stack || []) {
    if (!layer?.route) continue;
    for (const entry of layer.route.stack || []) {
      if (typeof entry.handle !== 'function' || entry.handle.__wrapped) continue;
      if (entry.handle.length >= 4) continue;
      entry.handle = wrap(entry.handle);
    }
  }

  return router;
}
