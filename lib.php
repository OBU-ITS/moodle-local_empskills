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
    global $CFG;
	
	if (!empty($CFG->enableportfolios) && has_capability('moodle/blog:create', context_system::instance())) { // Only show if allowed
		$nodeProfile = $navigation->find('myprofile', navigation_node::TYPE_UNKNOWN); // The required grandparent
		if ($nodeProfile) {
			$nodeEmpskills = $nodeProfile->get('empskills', navigation_node::TYPE_UNKNOWN); // Parent ('get' faster than 'find')
			if (!$nodeEmpskills) { // Add the parent if necessary
				$nodeEmpskills = $nodeProfile->add(get_string('empskills', 'local_empskills'),
					null, navigation_node::TYPE_CUSTOM, null, 'empskills', null); // The 'key' is 'empskills'
			}
			if ($nodeEmpskills) {
				$nodeEmpskills->add(get_string('exportskills', 'local_empskills'), '/local/empskills/empskills.php'); // Add the option
			}
		}
	}
}
