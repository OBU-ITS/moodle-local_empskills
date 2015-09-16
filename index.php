<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Employability Skills landing page.  Get a token and launch the app in the browser.
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');

$token = urldecode(optional_param('token', null, PARAM_ALPHANUMEXT));
$home = new moodle_url('/');
if (isloggedin()) {
	$isloggedin = 'true';
} else {
	$isloggedin = 'false';
}
	
?>
<!DOCTYPE html>
<html>
<head>
    <title>Employability Skills</title>
    <meta name="author" content="Oxford Brookes University" />
    <meta charset="utf-8" />
</head>
<body>
    <script type="text/javascript">
		var token = "<?php echo $token; ?>";
		var home = "<?php echo $home; ?>";
		var isloggedin = "<?php echo $isloggedin; ?>";
		
		if (token == "") { // First time through
			var url = encodeURIComponent(window.location.href); // Return here when we're logged-in and tokened-up
			var service = encodeURIComponent("empskill_ws");
			var launch = home + "local/obu_login/launch.php?scheme=" + url + "&service=" + service;
			var options = "width=480, height=640, location=no, menubar=no, status=no, titlebar=no, toolbar=no";
			var popup = window.open(launch, "_blank", options); // Open a new tab for the app
			if (!popup || popup.closed || (typeof popup.closed == 'undefined')) { // No popups allowed?
				window.location = launch; // Reuse the old tab
			} else if (isloggedin == "true") {
				window.location = home + "my"; // Send the old tab back to base
			} else {
				window.close(); // Close the old tab
			}
		} else { // Take flight my son
			window.sessionStorage.setItem("empskill_ws_token", token);
			window.location = home + "local/empskills/www/index.html";
		}
    </script>
</body>
</html>