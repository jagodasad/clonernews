
/*TO BE DONE: 
- FETCH LATEST ID
- CHECK FOR UPDATE
- ORGANISE/ADD HTML
- CSS
- TOGGLE AND FETCH COMMENTS
- PRINT COMMENTS
- DON'T KNOW WHY THE BUTTONS ARE NOT WORKING (CHECK THE TOGGLE BUTTON FUNCTION FOR THEM (CLASS NAME= "PAGE-TITLE, THAT'S HOW IT'S LINKED TO HTML"))
- NAVBAR'S AHREF LINK IS SET TO NOTHING ATM
*/


let state = {};
let storiesPrint = false;
let selectPage = "topstories";
const hackernewsURL = "https://hacker-news.firebaseio.com/v0";
let result = document.getElementById("result");
let start = 0;
let x = 10;
let latestID;
let timer;

document.getElementById('a').style.backgroundImage = "url(../static/news.png)";
document.getElementById('a').style.backgroundRepeat = "no-repeat";
document.getElementById('a').style.backgroundSize = "cover";

//async function was best suggested here
async function fetchTS() {
    clearInterval(timer);
    document.querySelector(".container").style.display = "none";

    if (selectPage == "newstories") { fetchLatestID(); }

    const response = await fetch(`${hackernewsURL}/${selectPage}.json`);
    const topStoriesID_array = await response.json();
    return await fetchStories(topStoriesID_array);
}

//async function was best suggested here
async function fetchStories(array) {
    let topStoriesID = array.slice(start, x + start);
    let topStories = topStoriesID.map(async id => {
        const response = await fetch(`${hackernewsURL}/item/${id}.json`);
        return await response.json();
    });

    const topStories_1 = await Promise.all(topStories);
    state.stories = topStories_1;
    printStories(topStories_1);
}


function format_time(s) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
      timeStyle: 'medium',
      timeZone: 'UTC'
    });
    
    return dtFormat.format(new Date(s * 1e3));
  }
  
  console.log( format_time(12345) );  // "03:25:45"

function printStories(topStories_1) {
    return topStories_1.map(story => {
        let userURL = `https://news.ycombinator.com/user?id=${story.by}`
        let comment;

        story.descendants == 1 ? comment = "comment" : comment = "comments"

        let HTMLtoInsert = `
<div class="story" id="${story.id}">
<h3 class="title"> ${story.url ?
                `<a href='${story.url}' target='_blank'> ${story.title} </a>`
                : `<a href="javascript:void(0)" onclick="toggleStory('${story.id}')"> ${story.title} </a>`}
</h3>
<span class='score'> ${story.score} </span> points by <a href='${userURL}' target='_blank' class='story-by'> ${story.by}</a>, Time: <span class='time'> ${story.time} </span>, Type: <span class='type'> ${story.type} </span>
<div class="toggle-view">
${story.kids ?
                `<span onclick="fetchOrToggleComments('${story.kids}', '${story.id}')" class="comments"> ❯ show ${story.descendants} ${comment} </span>`
                : ''}
</div>
${story.text ?
                `<div class="storyText" id="storyText-${story.id}" style="display:block"> <span style="font-size: 300%">“</span> ${story.text} <span style="font-size: 300%">”</span> </div>`
                : ''}
<div id="comments-${story.id}" style="display:block">
</div>
</div> 
`
        result.insertAdjacentHTML('beforeend', HTMLtoInsert);
        storiesPrint = false;
    })
};

function toggleStory(storyID) {
    let storyText = document.getElementsById(`storyText-${storyID}`);

    // if it's visible, hide it
    if (storyText.style.display == "block") {
        storyText.style.display = "none"
    } else {
        storyText.style.display = "block"
    }
}


function toggleButton(str) {
    selectPage = str;
    start = 0;
    x = 10;
    result.innerHTML = "";
    fetchTS();

    let clickedButton = document.getElementById(str);
    let allButtons = document.getElementsByClassName("page-title");

    [...allButtons].forEach(button => button.className = "page-title unselected");
    clickedButton.className = "page-title";
}

// function repeatVar(str) {
//     console.log(str)
// }
async function fetchComments(kids, storyID) {
    let commentIDs = kids.split(",");
    let allComments = commentIDs.map(async (commentID) => {
        const response = await fetch(`${hackernewsURL}/item/${commentID}.json`);
        return await response.json();
    })
    const comments = await Promise.all(allComments);
    state[storyID] = comments;
    printComments(comments, storyID);
};
function fetchOrToggleComments(kids, storyID) {
    function toggleAllComments(storyID) {
        let allComments = document.getElementById(`comments-${storyID}`)
        if(allComments.style.display == "block") { allComments.style.display = "none"}
        else {allComments.style.display = "block"}
    }
    state[storyID] ? toggleAllComments(storyID) : fetchComments(kids, storyID)
};
function toggleComment(commentID) {
    let comment = document.getElementById(commentID);
    let toggle = document.getElementById(`toggle-${commentID}`);

    if(comment.style.display == "block") { comment.style.display = "none" }
    else { comment.style.display = "block" }
    
    if(toggle.innerHTML == '[ – ]') { toggle.innerHTML = '[ + ]' }
    else { toggle.innerHTML = '[ – ]' }
};
// to print all comments in the DOM
function printComments(comments, storyID)
{
    // For each comment in the array comment:
    return comments.map(comment => {

        let userURL = `https://news.ycombinator.com/user?id=${comment.by}`;
        let HTMLtoInsert = '';

        if(comment.deleted != true && comment.dead != true)
        {
            HTMLtoInsert =
            `
            <div class="comment">
                <span onclick="toggleComment(${comment.id})" href="javascript:void(0)" id="toggle-${comment.id}" class="toggle-comment" >[ – ]</span>
                <a href=${userURL} class="comment-by"> ${comment.by} </a>
                <div id=${comment.id} class="comment-text" style="display:block"> ${comment.text} </div>
            </div>
            `
        }
        if(comment.parent == storyID){
            document.getElementById(`comments-${storyID}`).insertAdjacentHTML("beforeend", HTMLtoInsert);
        }
        else {
            document.getElementById(comment.parent).insertAdjacentHTML("beforeend", HTMLtoInsert)
        }

        if(comment.kids) { return fetchComments(comment.kids.toString(), storyID) };
    });
}
// print more stories when the end of the page is reached
window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && storiesPrint === false) {
        storiesPrint = true;
        start += x
        fetchTS()
    }
}
fetchTS();

async function fetchLatestID() {

    latestID = await fetch(`${hackernewsURL}/${pageSelection}.json`)
    .then(response => response.json())
    .then(newStoriesID_array => newStoriesID_array[0]);

    timer = setInterval(checkForUpdate, 5000);
}

async function checkForUpdate() {

    let latestID_updated = await fetch(`${hackernewsURL}/${pageSelection}.json`)
        .then(response => response.json())
        .then(newStoriesID_array => newStoriesID_array[0]);

    if(latestID_updated != latestID)
    {
        document.querySelector(".container").style.display = '';
    }
};