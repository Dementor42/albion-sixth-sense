/* CONFIGURATION */

var timeout_between_checks = 2500; // ms
var average_loading_screen = 3000; // ms

/* THE PROGRAM (better don't touch it, unless you want to tweak it) */

var safe_tpl = new Image("safe.png");
var hate_tpl = new Image("hate.png");
var alert_sound_file = "alert.wav";
var ready_sound_file = "ready.wav";

var icon_match = new Match();
var indicator_size = new Size(80, 27);
var old_num_players = new Image(indicator_size);

function getNumPlayersImage()
{
	var screenshot = Desktop.takeScreenshot();
	return screenshot.copy(new Rect(
		icon_match.getRect().getLeft(),
		icon_match.getRect().getTop(),
		indicator_size.getWidth(),
		indicator_size.getHeight()
	));
}

function hatezone()
{
	// TODO: Hope the bf devs will add a "add margins" method to their rect type.
	var screenshot = Desktop.takeScreenshot();
	var icon_area = screenshot.copy(new Rect(
		icon_match.getRect().getLeft() - 10,
		icon_match.getRect().getTop() - 10,
		icon_match.getRect().getWidth() + 10,
		icon_match.getRect().getHeight() + 10
	));

	var love_match = Vision.findMatch(icon_area, hate_tpl, 0.97);
	return love_match.isValid();
}

function main()
{
	Helper.log("Continually searching for the indicator icon...");

	// Find the shield or crossed swords icons ingame
	while (!icon_match.isValid())
	{
		var screenshot = Desktop.takeScreenshot();
		var love_match = Vision.findMatch(screenshot, safe_tpl, 0.97);
		var hate_match = Vision.findMatch(screenshot, hate_tpl, 0.97);
		icon_match = love_match.isValid() ? love_match : hate_match;
		if (!icon_match.isValid()) { Helper.sleep(2); }
	}

	// Icon found. Notify the user.
	Helper.log("Indicator icon found. Ready to notify you.");
	Helper.playWavSound(ready_sound_file);

	while (true)
	{
		// Do not check for activity to often (will fuck up the CPU otherwise).
		Helper.msleep(timeout_between_checks);
		
		// Only alert the user while he is in a dangerous zone.
		if (!hatezone())
		{
			old_num_players = new Image();
			continue;
		}

		// To prevent false alerts we occasionally delete the old_num_players image.
		// Here we check whether such exists, if not we create one.
		if (old_num_players.isNull())
		{
			old_num_players = getNumPlayersImage();
			continue;
		}

		// Alert the user if the number of players in the unsafe area changed.
		var new_num_players = getNumPlayersImage();
		if (new_num_players.pixelEqualityTo(old_num_players) < 0.98)
		{
			Helper.playWavSound(alert_sound_file);
			Helper.log("The number of hostile players changed!");
		}
		old_num_players = new_num_players;
	}
}

main();