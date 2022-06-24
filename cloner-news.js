
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


function fetchTS() {

    clearInterval(timer);
    document.querySelector(".container").style.display = "none";

    if (selectPage == "newstories") { fetchLatestID(); }

    return fetch(`${hackernewsURL}/${selectPage}.json`)
        .then(response => response.json())
        .then(topStoriesID_array => fetchStories(topStoriesID_array));
}


function fetchStories(array) {

    let topStoriesID = array.slice(start, x + start);

    let topStories = topStoriesID.map(id => {
        return fetch(`${hackernewsURL}/item/${id}.json`)
            .then(response => response.json())
    });

    return Promise.all(topStories)
        .then(topStories => {
            state.stories = topStories
            printStories(topStories)
        });
}

function printStories(topStories) {

    return topStories.map(story => {

        let userURL = `https://news.ycombinator.com/user?id=${story.by}`

        let comment;
        story.descendants == 1 ? comment = "comment" : comment = "comments"

        let HTMLtoInsert = `
<div class="story" id="${story.id}">
<h3 class="title"> ${story.url ?
                `<a href='${story.url}' target='_blank'> ${story.title} </a>`
                : `<a href="javascript:void(0)" onclick="toggleStory('${story.id}')"> ${story.title} </a>`}
</h3>
<span class='score'> ${story.score} </span> points by <a href='${userURL}' target='_blank' class='story-by'> ${story.by}</a>
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

    if (storyText.style.display == "block") { storyText.style.display = "none" }
    else { storyText.style.display = "block" }
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


fetchTS();
