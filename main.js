// firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyC4ygtft0BU4qkF_kVWv3a6etBqbaloT_s",
  authDomain: "fitmeasure-ac726.firebaseapp.com",
  databaseURL: "https://fitmeasure-ac726.firebaseio.com",
  projectId: "fitmeasure-ac726",
  storageBucket: "fitmeasure-ac726.appspot.com",
  messagingSenderId: "1020504775390",
  appId: "1:1020504775390:web:6d8432d029a3e540b6004f",
  measurementId: "G-ZBXQWMKM2J",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
var userId;
const getRemaining = (countDownDate) => {
  // Get today's date and time
  var now = new Date().getTime();
  // Find the distance between now and the count down date
  var distance = countDownDate + 86400000 - now;
  if (distance < 0) {
    return false;
  }
  return true;
};

function createId(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// function to get all challenges of user with ID
const getUserChallenges = async (id) => {
  var challenges = await db.collection("challenges").get();
  var joined = [];
  challenges.docs.map((doc) => {
    if (doc.data().participants[id]) joined.push(doc.data());
  });
  return joined;
};

var currentChallenge;

function fillModal(titl, desc, cid) {
  document.getElementById("exampleModalCenterTitle").innerText = titl;
  $("#exampleModalCenter").find(".desc")[0].innerHTML =
    desc +
    '<p style = "color: red"><br> In order to join this challenge, you need to fill the form below. Please upload a video to validate your result. <br></p>';
  currentChallenge = cid;
}

var joinChallenge;

// Challenge page
const getChallenges = async () => {
  const snapshot = await db.collection("challenges").orderBy("createdAt").get();
  const challenges = snapshot.docs.map((doc) => doc.data());

  var create = el(
    ".text-center",
    { style: { marginTop: "1vh" } },
    el("button.btn btn-info", {
      innerHTML: `<i class="fas fa-plus" style="margin-right: 5px"></i>Create a challenge`,
      "data-toggle": "modal",
      "data-target": "#exampleModal",
      style: {
        width: "95%",
      },
    })
  );
  var cards = el("");
  challenges.reverse().forEach((challenge) => {
    const remaining = getRemaining(challenge.createdAt);
    joinButton = el("button.btn btn-success float-right", {
      innerText: "Joined",
      disabled: true,
    });
    if (remaining) {
      window.ch = challenge;
      var joinButton;
      if (!challenge.participants[userId])
        joinButton = el("button.btn btn-primary float-right", {
          innerText: "Join",
          onclick: () => {
            joinChallenge = challenge.id;
            console.log(challenge.id);
            // location.href = "join.html";
            // Router()
            // createForm(joinChallenge)
          },
        });
      joinButton.setAttribute("data-toggle", "modal");
      joinButton.setAttribute("data-target", "#exampleModalCenter");
      joinButton.setAttribute(
        "onclick",
        'fillModal("' +
          challenge.title +
          '","' +
          challenge.description +
          '","' +
          challenge.id +
          '")'
      );
      if (
        Object.keys(ch.participants).length == 10 &&
        !challenge.participants[userId]
      )
        joinButton = el("button.btn btn-danger float-right", {
          innerText: "Full",
          disabled: true,
        });

      const card = el(
        ".card mx-auto",
        { id: challenge.id },
        el(
          ".card-body bg-light",
          el(".card-title large", { innerText: challenge.title }, joinButton),
          el("p.card-title", {
            innerHTML: "Available for next: ",
          }),
          el("p.card-text")
        )
      );
      cards.appendChild(card);
      setTimer(challenge.id, challenge.createdAt);
    }
    // setTimer(challenge.id, challenge.createdAt);
  });

  var a = setChildren(
    document.getElementById("root"),
    el("#challenges1", create),
    el(".challenges", el("#challenges", cards))
  );
  document.getElementById("navigation").hidden = false;
};

function checkforms() {
  // get all the inputs within the submitted form
  var inputs = document.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; i++) {
    // only validate the inputs that have the required attribute
    if (inputs[i].hasAttribute("required")) {
      if (inputs[i].value == "") {
        // found an empty field that is required
        alert("Please fill all required fields");
        return false;
      }
    }
  }
  return true;
}

const submit = () => {
  const check = checkforms();
  if (!check) return;
  const challengeId = createId(16);

  var now = new Date().getTime();
  const formValues = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
  };
  db.collection("challenges")
    .doc(challengeId)
    .set({
      ...formValues,
      createdBy: userId,
      participants: { [userId]: { score: 0 } },
      id: challengeId,
      createdAt: now,
    });
  const joinButton = el("button.btn btn-primary float-right", {
    innerText: "Join",
    onclick: () => {
      joinChallenge = challengeId;
      // location.href = "join.html";
      // Router()
      // createForm(joinChallenge)
    },
  });
  joinButton.setAttribute("data-toggle", "modal");
  joinButton.setAttribute("data-target", "#exampleModalCenter");
  joinButton.setAttribute(
    "onclick",
    'fillModal("' +
      formValues.title +
      '","' +
      formValues.description +
      '","' +
      challengeId +
      '")'
  );
  const card = el(
    ".card mx-auto",
    { id: challengeId },
    el(
      ".card-body bg-light",
      el(".card-title large", { innerText: formValues.title }, joinButton),
      el("p.card-text", { innerText: setTimer(challengeId, now) })
    )
  );
  document.getElementById("challenges").prepend(card);
  document.getElementById("exampleModal").click();
  // setTimer(challengeId, now);
};

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

const loginScreen = () => {
  document.getElementById("root").hidden = true;
  document.getElementById("navigation").hidden = true;
  document.getElementById("info").hidden = false;
};