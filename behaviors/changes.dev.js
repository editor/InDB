window.dashChanges = window.dashAsync || (function (environment) {
  "use strict";
  return [ null, function (state) {
    return state;
    if(!this.isFunction(state.context.changes)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(ste) {
      setTimeout( function() {
	console.log('state',ste);
        deferred.resolve(ste);
      }, 3000 );
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
