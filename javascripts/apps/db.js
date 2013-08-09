(function(){

  var DB = function() { };

  DB.prototype.init = function(onSuccess) {
    var self = this;
    var dbRequest = indexedDB.open("MeT", 1);

    dbRequest.onsuccess = function(evt) {
      self.db = evt.target.result;
      onSuccess(self);
    };

    dbRequest.onupgradeneeded = function(evt) {
      var db = evt.target.result;
      var store = db.createObjectStore("posts", { keyPath: "created_at", autoincrement: false });
      store.createIndex("title", "title", { unique: false });
      store.createIndex("updated_at", "updated_at", { unique: false });
    };
  };

  DB.prototype.buildQuery = function(kv) {
    var store = this.db.transaction(["posts"]).objectStore("posts");
    return {
      store: kv.index ? store.index(kv.index) : store,
      range: kv.query ? IDBKeyRange.only(kv.query) : null,
      order: kv.order === 'desc' ? 'prev' : 'next',
      limit: kv.limit || 0
    };
  };

  DB.prototype.getPosts = function(kv, onSuccess) {
    var posts = [], count = 0;
    var query = this.buildQuery(kv);

    query.store.openCursor(query.range, query.order).onsuccess = function(evt) {
      var cursor = evt.target.result;
      if ((query.limit === 0 || query.limit > count) && cursor) {
        count++;
        posts.push(cursor.value);
        cursor.continue();
      } else {
        onSuccess(posts);
      }
    };
  };

  DB.prototype.putPost = function(data, onSuccess) {
    var transaction = this.db.transaction(["posts"], "readwrite");
    var store = transaction.objectStore("posts");
    var timestamp = parseInt((performance.timing.navigationStart + performance.now()) * 1000);
    data.created_at = data.created_at || timestamp;
    data.updated_at = timestamp;
    store.put(data).onsuccess = function(evt) {
      onSuccess(evt.target.result);
    };
  };

  DB.prototype.getPost = function(kv, onSuccess) {
    kv['limit'] = 1;
    this.getPosts(kv, function(posts) {
      onSuccess(posts[0]);
    });
  };

  DB.prototype.deletePost = function(key, onSuccess) {
    this.db.transaction("posts", "readwrite").objectStore("posts").delete(key).onsuccess = function(evt) {
      onSuccess();
    };
  };

  define([], function() {
    return new DB();
  });

}());
