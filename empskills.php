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
 * Employability Skills - export to portfolio
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University {@link http://www.brookes.ac.uk/}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once('view_empskills.php');

// Main page

// Check for correct permissions
require_login();
$context = context_system::instance();
require_capability('moodle/blog:create', $context);

// Create view...
$view = new view_empskills();

// ...and display it
$view->output_header();
$view->output_selection_start();
$view->output_selection_body();
$view->output_selection_end();
$view->output_footer();        
