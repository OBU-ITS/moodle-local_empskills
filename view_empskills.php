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
 * Form elements for the employability skill export process
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University {@link http://www.brookes.ac.uk/}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once($CFG->libdir . '/formslib.php');
require_once($CFG->libdir . '/portfoliolib.php');

class view_empskills {

    /** this */
    private $form = null;

    /** constructor */
    function __construct() {
        $this->setup_page();
    }

    /** set form */
    function set_form(moodleform $form) {
        $this->form = $form;
    }

    /** Set up the page and headings */
    private function setup_page() {
        global $PAGE;
        $PAGE->set_url('/local/empskills/empskills.php');
        $PAGE->set_pagelayout('standard');
        $PAGE->set_title(get_string('empskills', 'local_empskills'));
        $PAGE->set_heading(get_string('exportskills', 'local_empskills'));
    }

    /** Output text header */
    private function op_header() {
        global $OUTPUT;
        echo $OUTPUT->header();    
        echo $OUTPUT->heading(get_string('exportskills', 'local_empskills'));
    }

    /** Output the footer */
    private function op_footer() {
        global $OUTPUT;
        echo $OUTPUT->footer();
    }

    /** Output the header */
    function output_header() {
        $this->setup_page();
        $this->op_header();
    }

    /** Output footer text (back to previous link) */
    function output_footer($prev_url = '') {
        global $CFG;
        if ($prev_url) {
            echo '<p><br><a href="' . $prev_url . '">' . get_string('back', 'local_empskills') . '</a></p>';
        }
        $this->op_footer();
    }

    /** These output the page elements */
    function output_selection_start() {
        echo html_writer::start_tag('div');
        echo "<br>"; 
        echo "<br>";  
    }

    /** Output form elements for the selection */
    function output_selection_body() {
        echo '<table class="generaltable boxaligncenter">';
		
        echo '<tr class="heading">';
        echo '<th>' . get_string('selectmethod', 'local_empskills') . '</th>';
        echo '</tr>';
        
        echo '<tr>';
        echo '<td>';
        echo '<p><i>' . get_string('enter_selection', 'local_empskills') . '</i></p>';
        echo '</td>';
        echo '</tr>';
		
		$button = new portfolio_add_button();
        $button->set_callback_options('empskills_portfolio_caller', array('method' => 'ES-OBU'), 'local_empskills');
		$text = $button->to_html(PORTFOLIO_ADD_TEXT_LINK, get_string('es-obu', 'local_empskills'));
        if (empty($text)) {
			echo '<tr>';
			echo '<td>';
			echo html_writer::tag('div', 'No portfolio plugin available.');
			echo '</td>';
			echo '</tr>';
			echo '</table>';
			return;
        }
		echo '<tr>';
		echo '<td>';
		echo html_writer::tag('div', $text);
		echo '</td>';
		echo '</tr>';

		$button = new portfolio_add_button();
		$button->set_callback_options('empskills_portfolio_caller', array('method' => 'ES-CBI'), 'local_empskills');
		$text = $button->to_html(PORTFOLIO_ADD_TEXT_LINK, get_string('es-cbi', 'local_empskills'));
		echo '<tr>';
		echo '<td>';
		echo html_writer::tag('div', $text);
		echo '</td>';
		echo '</tr>';
		
		$button = new portfolio_add_button();
		$button->set_callback_options('empskills_portfolio_caller', array('method' => 'empskill'), 'local_empskills');
		$text = $button->to_html(PORTFOLIO_ADD_TEXT_LINK, get_string('empskill', 'local_empskills'));
		echo '<tr>';
		echo '<td>';
		echo html_writer::tag('div', $text);
		echo '</td>';
		echo '</tr>';
		
        echo '</table>';
    }
    
    /** End the selection */
    function output_selection_end() {
        echo html_writer::end_tag('div');
    }        
}
