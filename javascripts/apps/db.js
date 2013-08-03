(function(){

  var DB = function() {
    this.db;
    var dbRequest = indexedDB.open("MeT", 1);

    dbRequest.onerror = function(evt) {
      console.log(evt);
    };

    dbRequest.onsuccess = function(evt) {
      console.log(evt);
      db = evt.target.result;
    };

    dbRequest.onupgradeneeded = function(evt) {
      console.log(evt);
      var db = evt.target.result;
      var store = db.createObjectStore("posts", { keyPath: "created_at" });
      store.createIndex("title", "title", { unique: true });
      store.createIndex("updated_at", "updated_at", { unique: false });
      console.log(store);
    };
  };

  DB.prototype.getPosts = function(data) {
    var posts = [];
    var store = this.db.transaction(["posts"]).objectStore("posts");

    store.openCursor().onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        console.log(cursor.value);
        posts.push(cursor.value);
        cursor.continue();
      } else {
        console.log("No more entries!");
      }
    };
  };

  DB.prototype.putPost = function(data) {
    var transaction = this.db.transaction(["posts"], "readWrite");
    transaction.oncomplete = function(evt) {
      console.log(evt);
    };
    transaction.onerror = function(evt) {
      console.log(evt);
    };
    var store = transaction.objectStore("posts");
    var request = store.add({
      created_at: data.created_at || Date.now(),
      updated_at: Date.now(),
      title: data.title,
      content: data.content
    });
    request.onsuccess = function(evt) {
      console.log(evt);
    };
  };

  DB.prototype.getPost = function(data) {
    var transaction = this.db.transaction(["posts"]);
    var store = transaction.objectStore("posts");
    var request = store.get(data.created_at);
    request.onerror = function(evt) {
      console.log(evt);
    };
    request.onsuccess = function(evt) {
      console.log(evt);
    };
  };

  DB.prototype.deletePost = function(data) {
    var transaction = this.db.transaction(["posts"], "readWrite");
    var store = transaction.objectStore("posts");
    var request = store.delete(data.created_at);
    request.onsuccess = function(evt) {
      console.log(evt);
    };
  };

  define([], function() {
    return new DB();
  });

}());
