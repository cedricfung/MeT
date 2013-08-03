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

  DB.prototype.getPosts = function(onSuccess) {
    var posts = [];
    var store = this.db.transaction(["posts"]).objectStore("posts");

    store.openCursor().onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
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

  DB.prototype.getPost = function(data, onSuccess, onError) {
    this.db.transaction("posts").objectStore("posts").get(data.created_at).onsuccess = function(evt) {
      onSuccess(evt.target.result);
    }
  };

  DB.prototype.deletePost = function(data) {
    this.db.transaction("posts", "readwrite").objectStore("posts").delete(data.created_at);
  };

  define([], function() {
    return new DB();
  });

}());
