

//Enter webhooks below, Multiple link format is ["LINK_1", "LINK_2", "LINK_3"]
const webhooks = ["URLHERE"];

// URL for your forms reponse page goes here. Leave blank if you don't want 
const url = "RESPONSES URL";


// This defines the variables, of which can be filled out; these are completely optional.

// Title              :: Can either be what you enter below, but if you leave blank, the script will fill it with the form title.
// Webhook Username   :: Sets the useraneme of your webhook.
// Webhook Avatar     :: Sets your webhook avatar to the link you set.
// Avatar Image       :: A tiny thumbnail you'll see in embeds, this is great for a logo.
// Short Description  :: The text you set for this will go under your title in your webhook message.
// Colour             :: Allows you to enter a custom hex color, if left blank, a colour will be randomly chosen each time.
// Mention            :: Is great if you want to be alerted, or you want a certain role alerted. Mention either the user/role in Discord with a \ at the beginning to the formatting.
const title = "New Form Submitted", webhookUsername = "USERNAME", webhookAvatar = "URLHERE", avatarImage = "", shortDescription = "**[View Form Responses]("+`${url}`+")**", colour = "", mention = "";


// This defines and fetches the current form, all the responses from the form, the latest response received, and the items from the Q&A's from the latest res.
// Items is set up to store the Q&A's.
const form = FormApp.getActiveForm(), allResponses = form.getResponses(), latestResponse = allResponses[allResponses.length - 1], response = latestResponse.getItemResponses();
var items = [];



// Webhook URL checker
for (const hook of webhooks) {
    if (!/^(?:https?:\/\/)?(?:www\.)?(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-+]+$/i.test(hook)) throw `Webhook ${i + 1 || 1} is not valid.`;
}

//An extra check as people have been having issues.
if (avatarImage && !avatarImage.match(/\.(jpeg|jpg|gif|png)$/)) throw "Image URL is not a direct link";


// This loops through our latest response and fetches the Question titles/answers; then stores them in the items array above.

//You can limit how many
for (var i = 0; i < response.length - 9; i++) {
    const question = response[i].getItem().getTitle(), answer = response[i].getResponse();
    if (answer === "") continue;
    items.push({ "name": question, "value": answer });
    function data (item) { return [`**${item.name}**`, `${item.value}`].join("\n"); }
}


// A webhook error construct, which sets up the correct formatting for sending error to Discord.
const charerror = {
	"method": "post",
	"headers": { "Content-Type": "application/json" },
	"muteHttpExceptions": true,
	"payload": JSON.stringify({
		"embeds": [{
			"title": "**ERROR**",
          "description": "```diff\nExceeded Discords 2000 Character Limit, Please fix your form.\n```"
		}]
	}),
}

function plainText(e) {

	// A webhook construct, which sets up the correct formatting for sending to Discord.
	const text = {
		"method": "post",
		"headers": { "Content-Type": "application/json"	},
		"muteHttpExceptions": true,
		"payload": JSON.stringify({
			"content": `${mention ? mention : ''}${title ? `** ${title}**`:`**${form.getTitle()}**`}\n\n${shortDescription ? `${shortDescription}\n\n${items.map(data).join('\n\n')}` : items.map(data).join('\n\n')}`
		}),
	};

	// We now loop through our webhooks and send them one by one to the respectful channels.
	if (items.map(data).toString().length + shortDescription.length < 2000) {
		for (var i = 0; i < webhooks.length; i++) { UrlFetchApp.fetch(webhooks[i], text); };
	} 
    if (items.map(data).toString().length + shortDescription.length > 1999) {
      for (var i = 0; i < webhooks.length; i++) { UrlFetchApp.fetch(webhooks[i], charerror); };
	} 
}

function embedText(e) {

	// A webhook embed construct, which sets up the correct formatting for sending to Discord.
	const embed = {
		"method": "post",
		"headers": {"Content-Type": "application/json"},
		"muteHttpExceptions": true,
		"payload": JSON.stringify({
            "username": `${webhookUsername}`,
            "avatar_url": `${webhookAvatar}`,
			"content": mention ? mention : '',
			"embeds": [{
				"title": title ? title : form.getTitle(), // Either the set title or the forms title.
				"description": shortDescription ? `${shortDescription}\n\n${items.map(data).join('\n\n')}` : items.map(data).join('\n\n'), // Either the desc or just the res.
				"thumbnail": { url: avatarImage ? encodeURI(avatarImage) : null}, // The tiny image in the right of the embed
				"color": colour ? parseInt(colour.substr(1), 16) : Math.floor(Math.random() * 16777215), // Either the set colour or random.
				"timestamp": new Date().toISOString() // Today's date.
			}]
		}),
	};
	// We now loop through our webhooks and send them one by one to the respectful channels.
	if (items.map(data).toString().length + shortDescription.length < 2000) {
      for (var i = 0; i < webhooks.length; i++) { UrlFetchApp.fetch(webhooks[i], embed);};
	} 
    if (items.map(data).toString().length + shortDescription.length > 1999) {
      for (var i = 0; i < webhooks.length; i++) { UrlFetchApp.fetch(webhooks[i], charerror);};
	}
}