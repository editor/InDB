window.dashChanges = window.dashChanges || (function (environment) {
  "use strict";
  var callbackMap = {},
    changeMap = {},
    that,
    unregister = function(type, ctx) {

    },
    register = function(type, ctx) {
      var obj = ctx.changed;
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: [],
      };
      if (that.contains(['get.databases','get.database'], type)) {
        changeMap[ctx.database].callbacks.push(obj);
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          callbacks: [],
          indexes: {}
        };
        if (that.contains(['get.stores','get.store'], type)) {
          changeMap[ctx.database].stores[ctx.store].callbacks.push(obj);
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: [],
            entries: {}
          };
          if (that.contains(['get.index','get.indexes'], type)) {
            if (that.exists(ctx.idx)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].data = ctx.idx;
            }
            changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks.push(obj);
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['get.entry','get.entries', 'update.entry', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks.push(obj);
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['get.entry','get.entries', 'update.entry', 'remove.entry'], type)) {
              var key = ctx.primary_key || ctx.key;
              changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
              changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].entries[key].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].entries[key].callbacks.push(obj);
            }
        }        
      }
    },
    inquire = function(type, ctx) {
      var listeners = [],
          previous = null,
          current = null,
          obj = ctx.changed,
          key;
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: [],
      };
      if (that.contains(['remove.database', 'add.index', 'add.store'], type)) {
        listeners.push.apply(listeners, changeMap[ctx.database].callbacks);
        previous = changeMap[ctx.database].data;
        current = ctx.db;
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          callbacks: [],
          indexes: {}
        };
        if (that.contains(['remove.database', 'remove.store', 'clear.store', 'add.index'], type)) {
          listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].callbacks);
          previous = changeMap[ctx.database].stores[ctx.store].data;
          current = ctx.objectstore;
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: [],
            entries: {}
          };
          if (that.contains(['remove.index', 'remove.store', 'remove.database', 'clear.store'], type)) {
            listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks);
            previous = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].data;
            current = ctx.idx;
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['remove.store', 'clear.store', 'remove.database', 'update.entries', 'update.entry', 'remove.entries', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              previous = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data;
              current = ctx.entry;
              listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks);
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['get.entry', 'update.entries', 'update.entry', 'remove.entries', 'remove.entry', 'remove.database', 'remove.store', 'clear.store'], type)) {
              key = ctx.primary_key || ctx.key;
              changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
              changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
                callbacks: []
              };
              previous = changeMap[ctx.database].stores[ctx.store].entries[key].data;
              current = ctx.entry;
              listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].entries[key].callbacks);
            }
        }        
      }
      return {
        listeners: listeners,
        current: current,
        previous: previous
      };
    },
    notify = function(ctx, method, type) {
      var inquiry = inquire(method, ctx),
        listeners = inquiry.listeners || [],
        current = inquiry.current || {},
        previous = inquiry.previous || {},
        difference = function(one, two, shallow) {
          var diff = {};
          that.iterate(one, function(key, val) {
            if (that.isnt(JSON.stringify(val), JSON.stringify(previous[key]))) {
              if ( that.isnt(shallow, true) && ( ( that.exists(two[key]) && that.isObject(two[key]) ) || that.isObject(val))) {
                diff[ key ] = difference(val, two[key], shallow);
              } else {
                diff[ key ] = [val, two[key]];
              }
            }
          });
          that.iterate(two, function(key, val) {
            if (that.isnt(JSON.stringify(val), JSON.stringify(current[key])) && that.isEmpty(diff[ key ])) {
              if ( that.isnt(shallow, true) && (that.exists(one[key]) && that.isObject(one[key]) ) || that.isObject(val) ) {
                diff[ key ] = difference(one[key], val, shallow);
              } else {
                diff[ key ] = [one[key], val];
              }
            }
          });
          return diff;
        },
        diff = (that.is(ctx.difference, true)) ? difference(current, previous, ctx.shallow ? false : true) : false,
        args = { context: ctx, method: method, type: type, current: current, previous: previous, difference: diff };
      that.each(listeners, function(id) {
        that.apply(callbackMap[id], [ args ]);
      });
      return ctx;
    },
    randomId = function() {
      var random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        count = 16,
        x = 0,
        xlength = 0,
        strlen = random.length,
        str = [];
      for (x = 0; x < count; x += 1) {
        str.push(random[Math.floor(Math.random() * 100) % strlen]);
      }
      return str.join('');
    };
  return [ function(state) {
    if(!this.isFunction(state.context.changes)) {
      return state;
    }    
    that = this;
    var id = randomId();
    callbackMap[ id ] = state.context.changes;
    state.context.changes = id;
    return state;
  }, function (state) {
    that = this;
    if(!this.exists(state.context.changes)) {
      return notify(state.context, state.type);
    }
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(ste) {
      var id = ste.context.changes;
      ste.context.changes = callbackMap[ id ]; 
      ste.context.changed = ste.context.changed || id;
      notify(state.context, state.method, state.type);
      register(ste.method, ste.context);
      unregister(ste.method, ste.context);
      deferred.resolve(ste);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));