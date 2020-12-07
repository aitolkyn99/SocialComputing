var titles = [];
var cids = [];

const getLeaderBoard = async (chal) => {
  //   const snapshot = await db.collection("leaderboard").orderBy("score").get();
  //   const leaderboard = snapshot.docs.map((doc) => doc.data());
  var dropdown = `    <div class="btn-group d-flex p-2">
    <button type="button" class="btn dropdown-toggle mx-auto " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Select Challenge
    </button>
    <div class="dropdown-menu">`;

  cids = [];
  titles = [];
  //   currentUser = 0; //TODO: remove reassign to 0 ; this was just to check
  var challenges = db.collection("challenges").orderBy("participants");
  challenges.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      if (doc.data().participants[currentUser]) {
        titles.push(doc.data().title);
        cids.push(doc.data().id);
      }
    });
    titles.forEach(function (title, i) {
      dropdown +=
        `<a class="dropdown-item" href="#" onclick=selectChallenge('` +
        i +
        `')>` +
        title +
        `</a>`;
    });
    dropdown +=
      `<div class="dropdown-divider"></div>
                <p class="dropdown-item" style = "color: #D3d3d3"> You participated in ` +
      titles.length +
      ` challenges 
                </div>
            </div> `;
    if (!$("#root").find(".btn-group")[0]) {
      $("#root").prepend(dropdown);
    }
    if (!chal) {
      if (cids.length == 0) {
        selectChallenge(null);
      } else {
        selectChallenge(0);
      }
    } else {
      selectChallenge(cids.indexOf(chal));
    }
  });
  // var lal = getUserChallenges(currentUser)
  // lal.then(function (r) {
  //     console.log(r[0])
  // })

  var tbody = el("tbody");
  var table = el(
    "table.table text-center text-nowrap",
    el(
      "thead",
      el(
        "tr",
        el("th", { scope: "col", innerText: "Place" }),
        el("th", { scope: "col", innerText: "Nickname" }),
        el("th", { scope: "col", innerText: "Score" }),
        el("th", { scope: "col", innerText: "Video" })
      )
    ),
    tbody
  );
  var i = 0;
  var rank;

  setChildren(
    document.getElementById("root"),
    el(
      "#challenges1",
      el("h4.text-center", {
        style: { marginBottom: "0" },
      })
    ),
    el("#challenges", table)
  );
  // document.getElementById("challenges").appendChild(dropdown)
  // setChildren(document.getElementById("challenges"), table);
};

function selectChallenge(i) {
  var tbody = $("#challenges").find("tbody")[0];
  var table = $("#challenges").find("table");
  var place = $("#challenges1").find("h4")[0];
  if (i !== null) {
    table.show();
    $(".dropdown-toggle")[0].innerText = titles[i];
    var challenge = db
      .collection("challenges")
      .doc(cids[i])
      .get()
      .then(function (c) {
        var challId = c.data().id;
        var participants = c.data().participants;
        // Create items array
        var items = Object.keys(participants).map(function (key) {
          return [key, participants[key]["score"]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
          return second[1] - first[1];
        });
        var rank;
        tbody.innerHTML = "";

        var i = 0;
        const forLoop = async (_) => {
          for (var user in items) {
            user = items[user];
            var curUser = user[0];
            var curScore = user[1];
            const snapshot = await db.collection("users").doc(user[0]).get();
            const nick = snapshot.data().nickname;
            i += 1;
            var className = "";
            if (curUser == currentUser) {
              className = "#me";
              rank = i;
            }
            tbody.appendChild(
              el(
                `tr${className}`,
                el("th", { scope: "row", innerText: i }),
                el("td", { innerText: nick }),
                el("td", { innerText: curScore }),
                el("td", {
                  style: { cursor: "pointer" },
                  "data-toggle": "modal",
                  "data-target": "#modal1",
                  innerHTML:
                    '<i class="material-icons nav__icon">play_circle_filled</i>',
                  onclick: () => {
                    document.getElementById(
                      "videoModal"
                    ).src = `https://firebasestorage.googleapis.com/v0/b/quicknsweaty.appspot.com/o/${user[0]}%2F${challId}?alt=media`;
                  },
                }),
                el("td",  el("p.report", { "data-toggle": "modal", "data-target": "#modalPoll-1", onclick: () => { handleClick(snapshot.id, challId) }, innerText: "Report"})  )
              )
            );
          }

          place.innerHTML = `<strong> Your rank is ${rank} </strong>`;
          place.style.color = "#d2b309";
        };

        forLoop();
      });
  } else {
    table.hide();
    place.innerHTML = `<p>You have not participated in any challenge yet. Click <a class="bluediv" onclick="Router('chal'); getChallenges()">here</a> to see available challenges</p>`;
  }
}
var myFile;
function clickJoin() {
  var file = myFile;
  if (!file) return alert("Please select a file to upload!");
  if (!document.getElementById("defaultContactFormName").value)
    return alert("Please enter your score!");
  document.getElementById("exampleModalCenter").click();
  var score = $("#defaultContactFormName")[0].value;
  $("#defaultContactFormName")[0].value = "";
  var chal = db.collection("challenges").doc(currentChallenge.toString());
  chal.get().then(function (doc) {
    if (doc.exists) {
      chal.get().then((snapshot) => {
        tempParticipants = snapshot.data().participants;
        tempParticipants[currentUser] = { score: score };
        chal.update({
          participants: tempParticipants,
        });
      });
      document
        .getElementById(chal.id)
        .children[0].children[0].children[0].remove();
      document.getElementById(chal.id).children[0].children[0].appendChild(
        el("button.btn bjoin float-right", {
          innerText: "Joined",
          disabled: true,
        })
      );
    } else {
      alert("challenge is no longer available");
    }
  });
  uploadVideo(currentUser, currentChallenge);
}

function handleFileSelect(e) {
  console.log("here1");
  myFile = e.target.files; // FileList object
  // uploadVideo(currentUser, currentChallenge)
}

function uploadVideo(uid, cid) {
  // save with userID + challengeID
  var file = myFile[0];
  var storageRef = firebase.storage().ref(uid + "/" + cid);
  storageRef.put(file).then((snapshot) => {
    console.log(snapshot);
  });
  myFile = [];
}

document
  .getElementById("inputGroupFile01")
  .addEventListener("change", handleFileSelect, false);

// 3. change pictures
var reportUID;
var reportCID;
function handleClick (uid, cid){
  // event.stopPropagation();
  // event.stopImmediatePropagation();
  console.log(uid)
  console.log(cid)
  reportCID = cid
  reportUID = uid
};

const handleReport = async () => {
  const snapshot = await db.collection("reports").doc(reportUID).get();
  if (snapshot.data() && snapshot.data()[reportCID]) {
    db.collection("reports").doc(reportUID).set({
      [reportCID]: snapshot.data()[reportCID]+1,
    });
  } else {
    db.collection("reports").doc(reportUID).set({
      [reportCID]: 1,
    });
  }
  document.getElementById("reportCancel").click();
}