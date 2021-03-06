// SIGN-UP

document.getElementById("google-login").addEventListener("click", GoogleLogin);
document.getElementById("logout").addEventListener("click", Logout);
var CurrentUserName = document.getElementById("ProfileNameContainer");
var CurrentUserProfilePicture = document.getElementById("ProfilePicture");
var newnametext = document.getElementById("newname");

var Guser;
var provider = new firebase.auth.GoogleAuthProvider();
var db = firebase.firestore();
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    console.log(user.displayName);
    console.log(user.uid);

    Guser = user;
    profile(user);
  } else {
    // No user is signed in.
  }
});

db.collection("posts")
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log("test1");
      console.log(doc.id, " => ", doc.data());
    });
  });

db.collection("posts").onSnapshot((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    console.log("Docs data: ", doc.id);
    console.log("Docs data: ", doc.data());
  });
});

function GoogleLogin() {
  console.log("hi");
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      Guser = user;
      // Add a second document with a generated ID.
      var firestoreUsers = db.collection("users");
      firestoreUsers
        .doc(user.uid)
        .set({
          name: user.displayName,
          ProfilePic: user.photoURL,
        })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });

      console.log(user);
      profile(user);
      // ...
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
}

function Logout() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      // Sign-out successful.
      console.log("Sign-out successful.");
      var useR = firebase.auth().currentUser;

      console.log(useR);
      profile(useR);
    })
    .catch(function (error) {
      // An error happened.
    });
}

function profile(user) {
  if (user != null) {
    console.log("  Name: " + user.displayName);
    CurrentUserName.innerHTML = user.displayName;
    CurrentUserProfilePicture.src = user.photoURL;
  } else {
    CurrentUserName.innerHTML = `
    <p>Please Login.</p>
    `;
  }
}

//
//
//

const reader = new FileReader();
const fileInput = document.getElementById("SelectBtn");
const img = document.getElementById("SelectedPhoto");

var storageRef = firebase.storage().ref();

var file;
reader.onload = (e) => {
  img.src = e.target.result;
};

fileInput.addEventListener("change", (e) => {
  var f = e.target.files[0];
  file = f;
  reader.readAsDataURL(f);
  console.log(file);
});

var imgDownloadUrl;

// db.collection('things').add({ ...myData, createdAt: timestamp() })
// // Query
// db.collection('things').orderBy('createdAt').startAfter(today)

function uploadPhoto() {
  console.log("hi");
  // Points to the root reference
  console.log(file);

  var imagesRef = storageRef
    .child("images/" + Guser.uid + "/")
    .child(file.name);
  imagesRef
    .put(file)
    .then((snapshot) => {
      console.log("Uploaded successfuly!");
      imagesRef.getDownloadURL().then(function (url) {
        imgDownloadUrl = url;
        console.log(url);
        imgStoragePath = imagesRef._delegate._location.path_;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp;

        var postTXT = document.getElementById("UploadPostText").value;
        var firestorePosts = db.collection("posts");
        firestorePosts
          .add({
            userID: Guser.uid,
            img: imgDownloadUrl,
            imgStoragePath: imgStoragePath,
            text: postTXT,
            createdAt: timestamp(),
          })
          .then(() => {
            console.log("Document successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      });
      alert("Uploaded successfuly!");
    })
    .catch(function (error) {});
  console.log(imgDownloadUrl);
}

function downloadPhoto() {
  //db.collection('posts').orderBy('createdAt', 'asc')

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        //console.log("test1");
        //console.log(doc.id, " => ", doc.data());
        var un = doc.data().userID;
        var postTxt = doc.data().text;
        var PostDate = doc.data().createdAt.toDate().toDateString();
        var imgurl = doc.data().img;

        var imgStoragePath = doc.data().imgStoragePath; //for deleting the img
        var postid = doc.id; //post id for deleting the post

        var docRef = db.collection("users").doc(un);
        var username;
        var userprofpic;

        docRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              console.log("Document data:", doc.data());
              var data = doc.data();
              username = data.name;
              userprofpic = data.ProfilePic;
              console.log(data.name);
              console.log(data);

              createElem(
                imgurl,
                username,
                PostDate,
                userprofpic,
                postTxt,
                un,
                postid, //post id for deleting the post
                imgStoragePath //for deleting the img
              );
            } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
            }
          })
          .catch((error) => {
            console.log("Error getting document:", error);
          });
      });
    });
}

function downloadPost() {}

downloadPhoto();

//
//
//
function createElem(
  url,
  username,
  postdate,
  userprofpic,
  posttxt,
  userid,
  postid, //post id for deleting the post
  imgStoragePath // for deleting the img
) {
  if (userprofpic == undefined) {
    userprofpic =
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80";
  }

  var PostContainer = document.createElement("div");
  PostContainer.setAttribute("class", "PostContainer");
  PostContainer.setAttribute("id", "PostContainer");

  var PostHeadCon = document.createElement("div");
  PostHeadCon.setAttribute("id", "PostHeaderContainer");
  PostHeadCon.setAttribute("class", "PostHeaderContainer");
  //
  //user info
  var UserInfo = document.createElement("div");
  UserInfo.setAttribute("id", "UserInfo");
  UserInfo.setAttribute("class", "UserInfo");

  var UserPic = document.createElement("dic");
  UserPic.setAttribute("id", "UserPic");
  UserPic.setAttribute("class", "UserPic");
  UserPic.innerHTML = `
  <img src="${userprofpic}" alt="User Photo" />
  `;

  var UserName = document.createElement("div");
  UserName.setAttribute("id", "UserName");
  UserName.setAttribute("class", "UserName");
  UserName.innerHTML = `
  <p>${username}</p>
  `;
  //post date
  var PostDate = document.createElement("div");
  PostDate.setAttribute("id", "PostDate");
  PostDate.setAttribute("class", "PostDate");
  PostDate.innerHTML = `
  <p>${postdate}</p>
  `;

  //Post
  var Post = document.createElement("div");
  Post.setAttribute("id", "Post");
  Post.setAttribute("class", "Post");
  Post.innerHTML = `
  <p id="PostText" class="PostText">${posttxt}</p>
  <img src="${url}" alt="Photo" id="PostImage" class="PostImage" loading="lazy" />
  `;
  var dBtn = document.createElement("div");
  dBtn.innerHTML = `
  <button id="DeletePostBtn" class="DeletePostBtn">DELETE POST</button>
  `;

  //Post
  PostContainer.appendChild(PostHeadCon);

  PostHeadCon.appendChild(UserInfo);
  PostHeadCon.appendChild(PostDate);

  UserInfo.appendChild(UserPic);
  UserInfo.appendChild(UserName);

  if (userid == Guser.uid) {
    //dBtn.setAttribute("onclick", "DeletePost(postid, imgStoragePath)");
    dBtn.addEventListener("click", function () {
      DeletePost(postid, imgStoragePath);
    });
    Post.appendChild(dBtn);
  } else {
    null;
  }

  PostContainer.appendChild(Post);

  document.getElementById("PostsContainer").appendChild(PostContainer);
}

function editProfile() {
  console.log("edit called");

  var newName = newnametext.value;

  var user = firebase.auth().currentUser;

  user
    .updateProfile({
      displayName: newName,
    })
    .then(function () {
      // Update successful.
      var docRef = db.collection("users").doc(user.uid);
      docRef
        .update({
          name: newName,
        })
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });

      console.log("Update successful.");
    })
    .catch(function (error) {
      // An error happened.
      console.log("An error happened." + error);
    });
}

//deleting the post
function DeletePost(postid, imgStoragePath) {
  db.collection("posts")
    .doc(postid)
    .delete()
    .then(() => {
      console.log("Document successfully deleted!");
      alert("Deleted successfuly!");
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
      alert("Error removing document: ", error);
    });
  var imgpathref = storageRef.child(imgStoragePath);
  imgpathref
    .delete()
    .then(() => {
      // File deleted successfully
      alert("Img successfully deleted");
    })
    .catch((error) => {
      // Uh-oh, an error occurred!
    });
}
