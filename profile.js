const getProfile = async (profileId = userId) => {
  var user = await db.collection("users").doc(profileId).get();
  const joined = await getUserChallenges(profileId);
  user = user.data();
  var userPage = el(
    "#challenges1",
    { style: { height: "35vh", overflow: "auto" } },
    el(
      ".card mx-auto",
      el(
        ".card-body bg-dark",
        el(
          ".card-title text-white",
          el(
            "",
            el(
              ".text-center",
              el("img.rounded-circle", {
                src: user.imgUrl,
                style: { height: "72px", width: "72px" },
              })
            ),
            el(
              "",
              el(".text-center large", {
                innerText: `Name: ${user.nickname}`,
                style: { marginTop: "10px" },
              }),
              el(".text-center large", {
                innerText: `Email address: ${user.email}`,
              }),
              el(
                ".text-center",
                el("button.btn btn-danger", {
                  innerText: "Sign out",
                  onclick: () => signOut(),
                })
              )
            )
          )
        )
      )
    )
  );
  var tbody = el("tbody");
  var previous = el(
    "table.table text-center text-nowrap",
    el(
      "thead",
      el(
        "tr",
        el("th", { scope: "col", innerText: "Challenge name" }),
        el("th", { scope: "col", innerText: "Score" }),
        el("th", { scope: "col", innerText: "Video" })
      )
    ),
    tbody
  );
  joined.forEach((element) => {
    tbody.appendChild(
      el(
        "tr",
        el("th", {
          scope: "row",
          innerText: element.title,
          style: { cursor: "pointer" },
          onclick: () => {
            getLeaderBoard(element.id);
            Router("lead");
          },
        }),
        el("td", { innerText: element.participants[profileId].score }),
        el("td", {
          innerHTML:
            '<i class="material-icons nav__icon">play_circle_filled</i>',
          onclick: () => {
            window.open(
              `https://firebasestorage.googleapis.com/v0/b/quicknsweaty.appspot.com/o/${profileId}%2F${element.id}?alt=media`
            );
          },
        })
      )
    );
  });
  setChildren(
    document.getElementById("root"),
    userPage,
    el(
      ".challenges",
      { style: { height: "56vh" } },

      el("#challenges", previous)
    )
  );
};
