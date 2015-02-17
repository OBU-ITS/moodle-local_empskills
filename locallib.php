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
 * Library of functions for Employability Skills
 *
 * @package    empskills
 * @category   local
 * @copyright  2015, Oxford Brookes University {@link http://www.brookes.ac.uk/}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
 
require_once($CFG->libdir . '/portfolio/caller.php');
require_once($CFG->dirroot . '/blog/locallib.php');


class empskills_portfolio_caller extends portfolio_caller_base {

    protected $method;

    private $entries;
	private $lastcategory;
	private $lastskill;

    public static function expected_callbackargs() {
        return array(
            'method' => true
        );
    }
	
    function __construct($callbackargs) {
        parent::__construct($callbackargs);
    }
	
    public function load_data() {
        global $DB;

    	$this->add_format(PORTFOLIO_FORMAT_PLAINHTML);
		$this->entries = $this->get_tagged_entries();
	}
	
	private function get_tagged_entries() {
        global $DB, $USER;

		// Get the tag ID of the given method (the category class name)
		if ($this->method == 'empskill') {
			$criteria = "rawname = '" . get_string('empskill', 'local_empskills') . "'";
		} else {
			$criteria = "rawname = '" . $this->method . "'";
		}
	    if (!($class = $DB->get_record_select('tag', $criteria, null, 'id, rawname'))) {
			throw new portfolio_plugin_exception('category tag not found');
		}
		
		$categories = array();
		if ($this->method == 'empskill') {
			$categories[] = array(
				'id' => $class->id,
				'name' => $class->rawname
			);
		} else {
			// Store the ID of each related tag (category) in an array
			$criteria = "tagid = '" . $class->id . "' AND itemtype = 'tag'";
			$db_ret = $DB->get_records_select('tag_instance', $criteria, null, 'itemid');
			$ids = array();
			foreach ($db_ret as $row) {
				$ids[] = $row->itemid;
			}
		
			// Get the sorted names of the related tags (categories) and store them in an array
			$db_ret = $DB->get_records_list('tag', 'id', $ids, 'name', 'rawname, id');
			foreach ($db_ret as $row) {
				$categories[] = array(
					'id' => $row->id,
					'name' => $row->rawname
				);
			}
		}
		
		$skills = array();
		foreach ($categories as $category) {
			// Store the ID of each related tag (skill) in an array
			$criteria = "tagid = '" . $category['id'] . "' AND itemtype = 'tag' AND itemid <> '" . $class->id . "'";
			$db_ret = $DB->get_records_select('tag_instance', $criteria, null, 'itemid');
			$ids = array();
			foreach ($db_ret as $row) {
				$ids[] = $row->itemid;
			}
		
			// Get the sorted names of the related tags (skills) and store them in an array
			$db_ret = $DB->get_records_list('tag', 'id', $ids, 'name', 'rawname, id');
			foreach ($db_ret as $row) {
				$skills[] = array(
					'category' => $category['name'],
					'id' => $row->id,
					'name' => $row->rawname
				);
			}
		}
		
		$tagged_entries = array();
		$count = 0;
		foreach ($skills as $skill) {
			$blog = new blog_listing(
				array(
					'user' => $USER->id,
					'tag' => $skill['id']
				)
			);
			$blog_entries = $blog->get_entries();
			foreach ($blog_entries as $row) {

				$blog_entry = new blog_entry($row->id); // required to get the course association (bug?)
				$course_name = '';
				if ($blog_entry->courseassoc != 0) {
					if (($context = $DB->get_record('context', array('id' => $blog_entry->courseassoc)))) {
						if (($course = $DB->get_record('course', array('id' => $context->instanceid)))) {
							$course_name = $course->fullname;
							$split_pos = strpos($course_name, ' (');
							if ($split_pos !== false) {
								$course_name = substr($course_name, 0, $split_pos);
							}
						}
					}
				}
		
				$count++;
				$tagged_entries[] = array(
					'id' => $count,
					'category' => $skill['category'],
					'skill' => $skill['name'],
					'created' => $blog_entry->created,
					'subject' => $blog_entry->subject,
					'course' => $course_name,
					'summary' => $blog_entry->summary,
					'summaryformat' => $blog_entry->summaryformat
				);
			}
		}
		
		return $tagged_entries;
	}
	
    function get_return_url() {
        global $CFG;
        return $CFG->wwwroot . '/local/empskills/empskills.php';
    }
	
    function get_navigation() {
        global $CFG;

        $navlinks = array();
        $navlinks[] = array(
            'name' => format_string(get_string('empskills', 'local_empskills')),
            'link' => $CFG->wwwroot . '/local/empskills/empskills.php',
            'type' => 'title'
        );
        return array($navlinks);
    }
	
    function prepare_package() {

        if ($this->exporter->get('formatclass') == PORTFOLIO_FORMAT_LEAP2A) {
			$this->prepare_leap2a_package();
		} else {
			$this->prepare_html_package();
        }
		
		return;
    }
	
    function prepare_leap2a_package() {

		$leapwriter = $this->exporter->get('format')->leap2a_writer();
		
		$ids = array(); // keep track of all entry ids so we can add a selection element
		foreach ($this->entries as $entry) {
			$ids[] = $this->prepare_leap2a_entry($leapwriter, $entry);
		}

		$manifest = ($this->exporter->get('format') instanceof PORTFOLIO_FORMAT_RICH);
		
		// add on an extra 'selection' entry
		$selection = new portfolio_format_leap2a_entry('selection', get_string('empskills', 'local_empskills'), 'selection');
		$leapwriter->add_entry($selection);
		$leapwriter->make_selection($selection, $ids, 'Grouping');
		
		$content = $leapwriter->to_xml();
		$name = $this->get('exporter')->get('format')->manifest_name();
	
		$this->get('exporter')->write_new_file($content, $name, $manifest);
		
		return;
    }

    private function prepare_leap2a_entry(portfolio_format_leap2a_writer $leapwriter, $entry) {
		
        $summary = format_text($entry['summary'], $entry['summaryformat'], portfolio_format_text_options());
        $leap_entry = new portfolio_format_leap2a_entry($entry['id'],  $entry['subject'], 'entry', $summary);
        $leap_entry->published = $entry['created'];
        $leap_entry->add_category('web', 'resource_type');
        $leapwriter->add_entry($leap_entry);
		
        return $leap_entry->id;
    }
	
    function prepare_html_package() {

        $content = '<table border="0" cellpadding="3" cellspacing="0" class="forumpost">';
        $content .= '<tr class="header">';
		if ($this->method != 'empskill') {
			$content .= '<td>Category</td>';
		}
		$content .= '<td>Skill</td><td>Date</td><td>Title</td><td>Course</td><td>Body</td><td>Link</td></tr>' . "\n";
		
		$this->lastcategory = '';
		$this->lastskill = '';
		foreach ($this->entries as $entry) {
			$entryhtml =  $this->prepare_html_entry($entry);
			$content .= $entryhtml;
		}
		
        $content .= '</table>' . "\n";
		
		$manifest = ($this->exporter->get('format') instanceof PORTFOLIO_FORMAT_RICH);
		$this->get('exporter')->write_new_file($content, 'empskills.html', $manifest);
    }
	
    private function prepare_html_entry($entry, $fileoutputextras=null) {
        global $DB, $USER;

        // format the text
		$summary = $entry['summary'];
		$split_pos = strpos($summary, '<p><a id="es-link" href="');
		if ($split_pos == false) {
			$link = '';
		} else {
			$link = substr($summary, ($split_pos + 25));
			$summary = substr($summary, 0, $split_pos);
			$split_pos = strpos($link, '"');
			if ($split_pos !== false) {
				$link = substr($link, 0, $split_pos);
			}
		}
        $summary = format_text($summary, $entry['summaryformat'], portfolio_format_text_options());

		$output .= '<tr>';
		if ($this->method != 'empskill') {
			$output .= '<td class="category">';
			if ($entry['category'] != $this->lastcategory) {
				$output .= $entry['category'];
				$this->lastcategory = $entry['category'];
				$this->lastskill = '';
			}
			$output .= '</td>';
		}
		$output .= '<td class="skill">';
		if ($entry['skill'] != $this->lastskill) {
			$output .= $entry['skill'];
			$this->lastskill = $entry['skill'];
		}
        $output .= '</td>';
		$output .= '<td class="date">' . date('l, j F Y, g:i A', $entry['created']) . '</td>';
		$output .= '<td class="title">' . format_string($entry['subject']) . '</td>';
        $output .= '<td class="course">' . format_string($entry['course']) . '</td>';
        $output .= '<td class="body">' . $summary . '</td>';
        $output .= '<td class="link"><a href="' . $link . '" target="_blank">' . $link . '</a></td>';
        $output .= '</tr>' . "\n";

        return $output;
    }

    function get_sha1() {
        $filesha = '';
        try {
            $filesha = $this->get_sha1_file();
        } catch (portfolio_caller_exception $e) { } // no files

		$sha1s = array($filesha);
		foreach ($this->entries as $entry) {
			$sha1s[] = sha1($entry['subject'] . ',' . $entry['summary']);
		}
		return sha1(implode(',', $sha1s));
     }

    function expected_time() {
        $filetime = $this->expected_time_file();
        if ($this->entries) {
            $entrytime = portfolio_expected_time_db(count($this->entries));
            if ($filetime < $entrytime) {
                return $entrytime;
            }
        }
        return $filetime;
    }
	
    function check_permissions() {
        $context = context_system::instance();
        return has_capability('moodle/blog:create', $context);
    }
	
    public static function display_name() {
        return get_string('empskills', 'local_empskills');
    }
	
    public function set_context($PAGE) {
		return;
    }

    public static function base_supported_formats() {
        return array(PORTFOLIO_FORMAT_FILE, PORTFOLIO_FORMAT_RICHHTML, PORTFOLIO_FORMAT_PLAINHTML, PORTFOLIO_FORMAT_LEAP2A);
    }
}
