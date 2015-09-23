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
 * Employability Skills - BRISC host page.
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');

require_login();
$context = context_system::instance();
require_capability('moodle/blog:create', $context);

$url = new moodle_url('/local/empskills/brisc.php');
$launch = new moodle_url('/local/empskills/launch.php');
$heading = 'BRISC';

$PAGE->set_url($url);
$PAGE->set_pagelayout('standard');
$PAGE->set_context($context);
$PAGE->set_title($heading);
$PAGE->set_heading($heading);

// The page contents
echo $OUTPUT->header();

echo '<center><iframe src="' . $launch . '" width="480" height="680"></iframe></center>';

?>
<h3>Brookes Individual Skills Catcher</h3>
This web and mobile app was developed by the Faculty of Business in conjunction with OBIS-IS and allows students to easily record incidents and reflections around employability skills that they have experienced whilst at Brookes.<br />
These records are very useful when preparing for a job interview.
<h4>Overview</h4>
<center><iframe width="480" height="270" src="https://www.youtube.com/embed/VKeVDL6O8kk" frameborder="0" allowfullscreen></iframe></center>
<center><strong>Produced by the Faculty of Business</strong></center>
<h4>Tutorial</h4>
<center><iframe width="480" height="270" src="https://www.youtube.com/embed/fQUCRsoQyYs" frameborder="0" allowfullscreen></iframe></center>
<center><strong>Produced by the Faculty of Business</strong></center>
<h4>Get the Mobile App</h4>
<p><a href="https://play.google.com/store/apps/details?id=uk.ac.brookes.empskill" target="_blank"><img src="images/android.png" alt="Android Mobiles"></a></p>
<p><a href="https://itunes.apple.com/gb/app/brookes-individual-skills/id950891908?mt=8" target="_blank"><img src="images/ios.png" alt="Apple Mobiles"></a></p>
<p><a href="http://www.windowsphone.com/en-gb/store/app/brisc/41ac44bf-26a8-44ca-931b-6b168976bb6d" target="_blank"><img src="images/windows.png" alt="Windows Mobiles"></a></p>
<?php

echo $OUTPUT->footer();


