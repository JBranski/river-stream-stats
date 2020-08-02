// new Twitch API URL
const searchURL = "https://api.twitch.tv/helix/";

// headers for fetch requests
const myHeaders = new Headers();
	myHeaders.append("Client-ID", "4r92p5c5s5oa70nu18wbvv9t2jc5tg");
	myHeaders.append("Authorization", "Bearer fak1u0aw433i510mzeyu39rdgynrfk");

const requestOptions = {
	method: 'GET',
	headers: myHeaders,
	redirect: 'follow'
};

// streamerinfo object to contain information to print out
const streamerInfo = {
	// streamer info
	id: "",
	name: "",
	type: "",
	profile_image: "",

	// stream info
	language: "",
	viewers: "",
	title: "",
	live: false,
	live_time: "",

	// game info
	game_id: "",
	game: "",

	// offline content
	last_vod: "",
	last_vod_date: "",
}


// streamer list API calls
function getStreamerList(streamer = " ", limit = 20){

	// fetch call to start list construction
	fetch(`${searchURL}search/channels?query=${streamer}&first=${limit}`, requestOptions)
		.then(response => {
			if(response.ok){
				return response.json()
			}
		})
		.then(result => constructStreamerInfo(result, limit))
		.catch(error => console.log('error', error));	
}

// contruct streamer info
async function constructStreamerInfo(results, limit){
	for(let i = 0; i < results.data.length; i++){
		await getStreamInfo(results, i);

		// get streamer type
		await fetch(`${searchURL}users?login=${streamerInfo.name}`, requestOptions)
			.then(response => {
				if(response.ok){
					return response.json()
				}
			})
			.then(result => getstreamerType(result, i))
			.catch(error => console.log('error', error));



		// if streamer is live, get viewers, game name, and preview
		if(streamerInfo.live == true){
			await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerInfo.id}`, requestOptions)
				.then(response => {
					if(response.ok){
						return response.json()
					}
				})
				.then(result => getStreamData(result, i))
				.catch(error => console.log('error', error));

			await fetch(`https://api.twitch.tv/helix/games?id=${streamerInfo.game_id}`, requestOptions)
				.then(response => response.json())
				.then(result => getGameData(result, i))
				.catch(error => console.log('error', error));
		}

		// get recent vod
		await fetch(`${searchURL}videos?user_id=${streamerInfo.id}&first=1`, requestOptions)
		.then(response => {
			if(response.ok){
				return response.json()
			}
		})
		.then(result => getLastVod(result, i))
		.catch(error => console.log('error', error));

		await generateListItem()
		console.log(streamerInfo);
	}
}



// get initial streamer data
function getStreamInfo(results, counter){
	let data = results.data[counter];

	streamerInfo.id = data.id;
	streamerInfo.name = data.display_name;
	streamerInfo.profile_image = data.thumbnail_url;

	streamerInfo.language = data.broadcaster_language;
	streamerInfo.title = data.title;
	streamerInfo.live = data.is_live;
	streamerInfo.live_time = data.started_at;

	streamerInfo.game_id = data.game_id;
}



// get streamer type
function getstreamerType(results, counter){
	streamerInfo.type = results.data[counter].broadcaster_type;
}



// get viewer count and preview if live
function getStreamData(results, counter){
	let data = results.data[counter];

	streamerInfo.viewers = data.viewer_count;
	streamerInfo.preview = data.thumbnail_url.replace("{width}", "256").replace("{height}","144"); 
}



// get the name of the game
function getGameData(results, counter){
	streamerInfo.game = results.data[counter].name
}



// get most recent vod
function getLastVod(results, counter){
	streamerInfo.last_vod = results.data[counter].id;
	streamerInfo.last_vod_date = new Date(results.data[counter].created_at);
}



// generate list items
function generateListItem(){
	let newListItem = `
		<li class="streamer-list-item">
			<article>
				<header>
					<img src="${streamerInfo.profile_image}" alt="${streamerInfo.name}'s Twitch profile image" class="streamer-image">
					<section>
						<h2>${streamerInfo.name}</h2>
						<p class="streamer-type">${streamerInfo.type}</p>
					</section>
					<a href="https://twitch.tv/${streamerInfo.name}" title="View ${streamerInfo.name} on Twitch!" target="_blank">
						<img src="./img/TwitchGlitchPurple.png" alt="Twitch logo">
					</a>
				</header>
				<section class="streamer-content">
	`;

	if(streamerInfo.live == true){
		newListItem += `
				<h3>${streamerInfo.title}</h3>
				<figure>
					<iframe
						src="https://player.twitch.tv/?channel=${streamerInfo.name}&parent=jbranski.github.io&autoplay=false"
						
						frameborder="0"
						scrolling="no"
						allowfullscreen="true">
					</iframe> 
					<figcaption>Streaming since ${streamerInfo.live_time} for ${streamerInfo.viewers} viewers</figcaption>
				</figure>
			</section>
			
		`
	}
	else{
		newListItem += `
				<h3>${streamerInfo.title}</h3>
				<figure>
					<iframe
						src="https://player.twitch.tv/?videos=v${streamerInfo.last_vod}&parent=jbranski.github.io&autoplay=false"	
						frameborder="0"
						scrolling="no"
						allowfullscreen="true">
					</iframe> 
					<figcaption>View VOD from ${streamerInfo.last_vod_date}</figcaption>
				</figure>
			</section>
			
		`
	}

	newListItem += `</li>`;

	$('.js-streamer-list').append(newListItem);
}



// form submissions function
function listLookups(){
	// streamer search submit form
	$('form.js-streamer-search').submit(e => {
		// prevent form submission
		e.preventDefault();

		// get values from form
		const streamerQuery = $('.js-streamer-query').val().trim();
		const streamerLimit = $('.js-streamer-limit').val();

		$('.js-streamer-list').empty();

		getStreamerList(streamerQuery, streamerLimit);
	})
}

// callback function
$(listLookups());
