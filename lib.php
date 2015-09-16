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
 * Provide left hand navigation link
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University {@link http://www.brookes.ac.uk/}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


function local_empskills_extends_navigation($navigation) {
    global $CFG, $USER, $PAGE;
 
	// Only let users with the appropriate capability see these navigation items
    if (!has_capability('moodle/blog:create', context_system::instance())) {
        return;
    }
    
	$nodeProfile = $navigation->find('myprofile');
	if (!$nodeProfile) {
		return;
	}
	
	$nodeEmpskills = $nodeProfile->add(get_string('empskills', 'local_empskills')); // Add the parent
	$nodeEmpskills->add('BRISC', '/local/empskills/brisc.php'); // BRISC web app
	if (!empty($CFG->enableportfolios)) { // Only relevant if portfolios are enabled
		$nodeEmpskills->add(get_string('exportskills', 'local_empskills'), '/local/empskills/empskills.php'); // ...and then the child
	}
}
