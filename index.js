const searchURL = "https://api.twitch.tv/helix/";

const myHeaders = new Headers();
	myHeaders.append("Client-ID", "4r92p5c5s5oa70nu18wbvv9t2jc5tg");
	myHeaders.append("Authorization", "Bearer fak1u0aw433i510mzeyu39rdgynrfk");

const requestOptions = {
	method: 'GET',
	headers: myHeaders,
	redirect: 'follow'
};

const streamerInfo = {
	id: "",
	login: "",
	name: "",
	type: "",
	profile_image: "",
	viewers: "",
	game_id: "",
	game: "",
	game_art: "",
	title: "",
	preview: "",
}



function clearStreamerList(){
	$('.js-streamer-list').empty();
}



function resetStreamerInfo(){
	streamerInfo.id = "";
	streamerInfo.login = "";
	streamerInfo.name = "";
	streamerInfo.type = "";
	streamerInfo.profile_image = "";
	streamerInfo.viewers = "";
	streamerInfo.game_id = "";
	streamerInfo.game = "";
	streamerInfo.game_art = "";
	streamerInfo.title = "";
	streamerInfo.preview = "";
}



// get the user data
function getUserData(results){
	let data = results.data[0];
	streamerInfo.id = data.id;
	streamerInfo.login = data.login;
	streamerInfo.name = data.display_name;
	streamerInfo.type = data.broadcaster_type;
	streamerInfo.type = streamerInfo.type[0].toUpperCase() + streamerInfo.type.slice(1);
	streamerInfo.profile_image = data.profile_image_url;
}



// get the stream data
function getStreamData(results){
	
	let data = results.data[0];
	streamerInfo.viewers = data.viewer_count;
	streamerInfo.game_id = data.game_id;
	streamerInfo.title = data.title;
	streamerInfo.preview = data.thumbnail_url.replace("{width}", "256").replace("{height}","144");
}



// get the game data
function getGameData(results){
	let data = results.data[0]
	streamerInfo.game = data.name;
	streamerInfo.game_art = data.box_art_url;
	streamerInfo.game_art = streamerInfo.game_art.replace("{width}", "150").replace("{height}", "200");
}



// create the list of streamers
function createStreamerList(){
	let streamerListItem = "";
	if(streamerInfo.viewers == 0){
		streamerListItem = `
			<li class="streamer-list-item">
				<section class="streamer-header">
					<img src="${streamerInfo.profile_image}" alt="${streamerInfo.name} Twitch profile image" class="streamer-logo">
					<div>
						<h3>${streamerInfo.name}</h3>
						<p class="js-stream-type">${streamerInfo.type} Streamer</p>
					</div>
					<a href="https://twitch.tv/${streamerInfo.login}" target="_blank">⚫</a>
				</section>
				<section class="streamer-content">
					<h4 class="offline-streamer">${streamerInfo.name} is offline</h4>
				</section>
			</li>
		`;
	}
	else {
		streamerListItem = `
			<li class="streamer-list-item">
				<section class="streamer-header">
					<img src="${streamerInfo.profile_image}" alt="${streamerInfo.name} Twitch profile image" class="streamer-logo">
					<div>
						<h3>${streamerInfo.name}</h3>
						<p class="js-stream-type">${streamerInfo.type} Streamer</p>
					</div>
					<a href="https://twitch.tv/${streamerInfo.login}" target="_blank">⚫</a>
				</section>
				<section class="streamer-content">
					<h4>${streamerInfo.title}</h4>
					<img src="${streamerInfo.game_art}" alt="${streamerInfo.game} cover art">
					<div>
						<p>${streamerInfo.game}</p>
						<p>Viewers: ${streamerInfo.viewers}</p>
					</div>
					<img src="${streamerInfo.preview}" alt="${streamerInfo.name}'s stream preview" class="streamer-preview">
				</section>
			</li>
		`;
	}

	$(".js-streamer-list").append(streamerListItem);
}




// streamer list API call
async function getStreamerInfo(streamer, limit = 20){
	await fetch(`${searchURL}users?login=${streamer}`, requestOptions)
		.then(response => {
			if(response.ok){
				return response.json()
			}
		})
		.then(result =>  getUserData(result))
		.catch(error => console.log('error', error));



	await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerInfo.id}`, requestOptions)
		.then(response => {
			if(response.ok){
				return response.json()
			}
		})
		.then(result => getStreamData(result))
		.catch(error => console.log('error', error));

		

	await fetch(`https://api.twitch.tv/helix/games?id=${streamerInfo.game_id}`, requestOptions)
		.then(response => response.json())
		.then(result => getGameData(result))
		.catch(error => console.log('error', error));
	
	
	
	await createStreamerList();
}


function listLookups(){
	$('form.js-streamer-search').submit(e => {
		e.preventDefault();
		const searchTerm = $('#streamer-name').val().trim();
		const searchLimit = $('#js-streamer-limit').val();
		resetStreamerInfo();
		if(searchTerm.length > 0){
			getStreamerInfo(searchTerm);
			$('#streamer-name').val('');
		}
	});

	$('#js-clear-list').on('click', function(){
		clearStreamerList();
	});
}

$(listLookups());