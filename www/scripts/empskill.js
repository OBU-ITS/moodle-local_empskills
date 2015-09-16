/*
 * Employability Skill app
 *
 * @package    empskill
 * @author     Peter Welham
 * @copyright  2015, Oxford Brookes University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 */

function handleOpenURL(url) {
    var searchString;
    var searchPos;
    var service;

    if (typeof url === "undefined") { // False alarm
        return;
    }
    
    // Trim-off and ignore the scheme - we already know what it is
    searchString = '://';
    searchPos = url.indexOf(searchString);
    if (searchPos < 0) { // Failed validation
        app.showAuthenticationPane();
        return;
    }
    url = url.substr(searchPos + searchString.length);

    // Get the service and the respective token (if any)
    searchString = '?token=';
    searchPos = url.indexOf(searchString);
    if (searchPos < 0) { // Not logged-in
        app.showAuthenticationPane();
    }
    service = url.substr(0, searchPos);
    app.token = url.substr(searchPos + searchString.length);

    window.localStorage.setItem(service + '_auth', app.auth); // Authentication method used must have been right!
    if (app.platform == 'browser') {
        window.sessionStorage.setItem(service + '_token', app.token); // Temporary
    } else {
        window.localStorage.setItem(service + '_token', app.token); // 'Permanent'
    }
    app.showClassesPane();
}

var app = {

    init: function (platform, version, moodle_url) {
        app.platform = platform;
        app.version = version;
        app.moodle_url = moodle_url;

        app.scheme = 'empskill';
        app.service = 'empskill_ws';
        app.auth = null;  // Authentication method to use/used
        app.token = null;  // Token granted by Moodle on authentication
        app.theme_names = []; // Names of possible colour themes
        app.theme = null;  // Name of chosen colour theme

        app.info_displayed = false;

        app.current_pane = null;
        app.current_class_id = 0;
        app.current_class_name = null;
        app.current_category_id = 0;
        app.current_category_name = null;
        app.current_skill_id = 0;
        app.current_skill_name = null;
        app.current_skill_description = null;
        app.current_entry_id = 0;
        app.current_course_id = 0;
        app.current_course_name = null;

        app.user_faculties = 0;
        app.current_faculty_id = 0;
        app.current_faculty_name = null;

        app.obu_tag = 'ES-OBU';
        app.cbi_tag = 'ES-CBI';
        app.emp_tag = 'Employability Skill';
        app.emp_tag_id = 0;

        $(document).on("deviceready", function () {

            $('#btn_logout').on('click', function () {
                app.token = null;
                if (app.platform == 'browser') {
                    window.sessionStorage.removeItem(app.service + '_token');
                } else {
                    window.localStorage.removeItem(app.service + '_token');
                }
                app.info_displayed = false;
                if (app.platform == 'browser') {
                    window.close();
                } else if (app.auth == 2) {
                    app.showLoginPane();
                } else {
                    window.open(app.moodle_url + '/local/obu_login/logout.php?scheme=' + app.scheme + '&service=' + app.service, '_system');
                }
            });

            $(document).on('backbutton', function () {
                if (app.info_displayed) {
                    switch (app.current_pane) {
                        case 'authentication':
                            app.showAuthenticationPane();
                            break;
                        case 'authorisation':
                            app.showAuthorisationPane();
                            break;
                        case 'login':
                            app.showLoginPane();
                            break;
                        case 'classes':
                            app.showClassesPane();
                            break;
                        case 'themes':
                            app.showThemesPane();
                            break;
                        case 'faculties':
                            app.showFacultiesPane();
                            break;
                        case 'faculty_menu':
                            app.showFacultyMenuPane();
                            break;
                        case 'faculty_stats':
                            app.showFacultyStatsPane();
                            break;
                        case 'course_stats':
                            app.showCourseStatsPane();
                            break;
                        case 'skill_stats':
                            app.showSkillStatsPane();
                            break;
                        case 'categories':
                            app.showCategoriesPane();
                            break;
                        case 'skills':
                            app.showSkillsPane();
                            break;
                        case 'entries':
                            app.showEntriesPane();
                            break;
                        case 'add_edit':
                            app.showAddEditPane();
                            break;
                        case 'entry':
                            app.showEntryPane();
                            break;
                        case 'delete_entry':
                            app.showConfirmEntryDeletePane();
                            break;
                    }
                    app.info_displayed = false;
                } else {
                    switch (app.current_pane) {
                        case 'authentication':
                        case 'authorisation':
                        case 'login':
                        case 'classes':
                            navigator.app.exitApp();
                            break;
                        case 'faculties':
                        case 'categories':
                        case 'themes':
                            app.showClassesPane();
                            break;
                        case 'faculty_menu':
                            if (app.user_faculties == 1) // We skipped faculties
                                app.showClassesPane();
                            else
                                app.showFacultiesPane();
                            break;
                        case 'faculty_stats':
                        case 'course_stats':
                            app.showFacultyMenuPane();
                            break;
                        case 'skill_stats':
                            app.showCourseStatsPane();
                            break;
                        case 'skills':
                            if (app.current_class_id == 0) // We skipped categories
                                app.showClassesPane();
                            else
                                app.showCategoriesPane();
                            break;
                        case 'entries':
                            app.showSkillsPane();
                            break;
                        case 'add_edit':
                            app.showEntriesPane();
                            break;
                        case 'entry':
                            app.showEntriesPane();
                            break;
                        case 'delete_entry':
                            app.showEntryPane();
                            break;
                    }
                }
            });

            $('#btn_back').on('click', function () {
                $(document).trigger('backbutton');
            });

            $('#btn_info').on('click', function () {
                app.showInfoPane();
            });

            pane_top = $('#page_header').height() + 10;
            $('#page_header').height(pane_top);
            $('div.pane').css('padding-top', pane_top + 'px');

            if (app.platform == 'android') {
                $('textarea').on('focus', function () {
                    setTimeout(function () {
                        $('body').scrollTop(140);
                    }, 1000);
                });

                // Allow for earlier versions of the operating system
                if (parseFloat(device.version) < 3) {
                    $(window).scroll(function () {
                        if (app.current_pane == 'classes' ||
	    				    app.current_pane == 'skills' ||
	    				    app.current_pane == 'entries' ||
		    			    app.current_pane == 'entry') {

                            var pane_footer_height = $('#pane_' + app.current_pane + ' div.pane_footer').outerHeight();
                            var pane_footer_top = $(window).scrollTop() + $(window).height() - pane_footer_height;

                            $('#pane_' + app.current_pane + ' div.pane_footer').css('top', pane_footer_top + 'px');
                        }
                    });
                }
            } else if (app.platform == 'ios') {
                $('select').on('blur', function () {
                    $('body').scrollTop(0);
                });
                $('textarea').on('blur', function () {
                    $('body').scrollTop(0);
                });
                $('input[type="text"]').on('blur', function () {
                    $('body').scrollTop(0);
                });
            } else if (app.platform == 'wp8') {
                $('textarea').on('focus', function () {
                    setTimeout(function () {
                        $('body').scrollTop(140);
                    }, 1000);
                });
                $('input[type="text"]').on('focus', function () {
                    setTimeout(function () {
                        $('div').scrollTop(140);
                    }, 1000);
                });
            }

//            if ((app.platform == 'windows') || (app.platform == 'wp8')) {
                app.auth = '2';
//            } else {
//                app.auth = window.localStorage.getItem(app.service + '_auth');
//            }
            if (app.platform == 'browser') {
                app.token = window.sessionStorage.getItem(app.service + '_token'); // Temporary
            } else {
                app.token = window.localStorage.getItem(app.service + '_token'); // 'Permanent'
            }
            app.theme = window.localStorage.getItem(app.service + '_theme');
            app.getThemes();
            app.switchTheme(app.theme);
            if (app.token == null) {
                app.showAuthenticationPane();
            } else {
                app.showClassesPane();
            }
        });
    },

    callWebservice: function (ws_function, data, success_cb, error_cb) {
        var url = app.moodle_url + '/webservice/rest/server.php';

        data.moodlewsrestformat = 'json';
        data.wstoken = app.token;
        data.wsfunction = ws_function;

        $.post(url, data)
			.done(function (data) {
			    if (data && 'errorcode' in data) {
			        if (data.errorcode == 'invalidtoken') {
			            console.log('token invalid or expired');
			            app.showAuthenticationPane();
			        } else {
			            error_cb(data);
			        }
			    } else {
			        success_cb(data);
			    }
			})
			.fail(error_cb);
    },

    hideAllPanes: function () {
        if (app.platform == 'ios') {
            $('body').scrollTop(0);
        }
        $('#btn_back').hide();
        $('#pane_short_title').hide();
        $('#pane_medium_title').hide();
        $('#pane_long_title').hide();
        $('#btn_refresh').hide();
        $('div.pane').hide();
    },

    showTitle: function (pane_title) {
        if (pane_title.length < 25) {
            $('#pane_short_title').html(pane_title);
            $('#pane_short_title').show();
        } else if (pane_title.length < 30) {
            $('#pane_medium_title').html(pane_title);
            $('#pane_medium_title').show();
        } else {
            var middle = app.findMiddle(pane_title);
            $('#pane_long_title').html('&nbsp;<br />' + pane_title.substr(0, middle) + '<br />' + pane_title.substr(middle + 1));
            $('#pane_long_title').show();
        }
    },

    setPaneFooterHeight: function (pane_id) {
        var buttons, button_height, footer_height;

        buttons = $('#' + pane_id + ' div.pane_footer' + ' button').length;
        button_height = $('#' + pane_id + ' div.pane_footer' + ' button').outerHeight(false);

        if (buttons == 1) {
            footer_height = button_height + 20;
        } else {
            footer_height = (buttons * button_height) + 25;
        }
        $('#' + pane_id + ' div.pane_footer').height(footer_height);

        if (buttons == 1) {
            $('#' + pane_id + ' div.pane_footer' + ' button').css('margin-top', '-' + (button_height / 2) + 'px');
        } else {
            $('#' + pane_id + ' div.pane_footer' + ' button:nth-child(1)').css('top', '0');
            $('#' + pane_id + ' div.pane_footer' + ' button').css('margin-top', '5px');
        }
        $('#' + pane_id).css('padding-bottom', footer_height);
    },

    showErrorDialog: function (error_msg) {
        $('#error_box p').html(error_msg);
        $('#error_box').show();
        window.setTimeout(function () {
            $('#error_box').fadeOut(300);
        }, 1500);
    },

    showDebugPane: function (debug_title, debug_msg) {
        app.hideAllPanes();

        app.info_displayed = true;
        app.showTitle(debug_title);

        $('#btn_back').show();

        $('#pane_debug p').html(debug_msg);
        $('#pane_debug').show();
    },

    showInfoPane: function () {
        app.hideAllPanes();

        app.info_displayed = true;
        app.showTitle('Information');
        $('#version').html(app.version);

        $('#btn_back').show();

        $('#pane_info').show();
    },

    showAuthenticationPane: function () {

        if (app.auth != null) { // method already determined
            if (app.auth == '2') {
                app.showLoginPane();
            } else {
                app.showAuthorisationPane();
            }
            return;
        }

        app.hideAllPanes();

        app.current_pane = 'authentication';
        app.showTitle('Authentication Method');

        $('#btn_back').hide();
        $('#btn_refresh').hide();
        $('#btn_logout').hide();

        $('#pane_classes button').prop('disabled', false);

        $('button[name="btn_auth_yes"]').off('click');
        $('button[name="btn_auth_yes"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.auth = 1; // standard authorisation method
//            app.showAuthorisationPane();
            window.open(app.moodle_url + '/local/obu_login/launch.php?scheme=' + app.scheme + '&service=' + app.service + '&standard=' + app.auth, '_system');

        });

        $('button[name="btn_auth_no"]').off('click');
        $('button[name="btn_auth_no"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.auth = 0; // non-standard authorisation method
//            app.showAuthorisationPane();
            window.open(app.moodle_url + '/local/obu_login/launch.php?scheme=' + app.scheme + '&service=' + app.service + '&standard=' + app.auth, '_system');
        });

        $('button[name="btn_auth_exit"]').off('click');
        $('button[name="btn_auth_exit"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            navigator.app.exitApp();
        });

        $('#pane_authentication').show();
    },


    showAuthorisationPane: function () {
        app.hideAllPanes();

        app.current_pane = 'authorisation';
        app.showTitle('Authorisation');

        $('#btn_back').hide();
        $('#btn_refresh').hide();
        $('#btn_logout').hide();

        $('#pane_classes button').prop('disabled', false);

        $('button[name="btn_authorise"]').off('click');
        $('button[name="btn_authorise"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            window.open(app.moodle_url + '/local/obu_login/launch.php?scheme=' + app.scheme + '&service=' + app.service + '&standard=' + app.auth, '_system');
        });

        $('button[name="btn_exit"]').off('click');
        $('button[name="btn_exit"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            navigator.app.exitApp();
        });

        $('#pane_authorisation').show();
    },

    showLoginPane: function () {
        app.hideAllPanes();

        app.current_pane = 'login';
        app.showTitle('Login');

        $('#btn_back').hide();
        $('#btn_refresh').hide();
        $('#btn_logout').hide();

        $('input[name="username"]').val('');
        $('input[name="password"]').val('');

        $('button[name="btn_login"]').prop('disabled', false);
        $('button[name="btn_login"]').html('Login');

        // Login button event handler
        $('button[name="btn_login"]').off('click'); // Show previous handler
        $('button[name="btn_login"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }

            var username = $('input[name="username"]').val();
            var password = $('input[name="password"]').val();

            if (!username || !password) {
                app.showErrorDialog('Username or password missing');
                return;
            }

            $('button[name="btn_login"]').prop('disabled', true);
            $('button[name="btn_login"]').html('Logging in...');

            var url = app.moodle_url + '/local/obu_login/token.php';
            $.post(url, {
                username: username,
                password: password,
                service: app.service
            }).done(function (data) {
                if ('error' in data) {
                    $('button[name="btn_login"]').prop('disabled', false);
                    $('button[name="btn_login"]').html('Login');
                    app.showErrorDialog('Error logging in');
                } else {
                    app.token = data.token;
                    window.localStorage.setItem(app.service + '_auth', '2');
                    if (app.platform == 'browser') {
                        window.sessionStorage.setItem(app.service + '_token', app.token); // Temporary
                    } else {
                        window.localStorage.setItem(app.service + '_token', app.token); // 'Permanent'
                    }
                    $('#btn_logout').show();
                    app.showClassesPane();
                }
            }).fail(function () {
                $('button[name="btn_login"]').prop('disabled', false);
                $('button[name="btn_login"]').html('Login');
                app.showErrorDialog('Error accessing Moodle');
            });
        });

        $('#pane_login').show();
    },

    showClassesPane: function () {
        app.hideAllPanes();

        app.current_pane = 'classes';
        app.showTitle('Selection Method');

        $('#btn_logout').show();
        $('#btn_back').hide();

        $('#btn_refresh').hide();
        $('#btn_get_stats').hide();

        $('#pane_classes button').prop('disabled', false);

        $('button[name="btn_obu_class"]').off('click');
        $('button[name="btn_obu_class"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.current_class_name = app.obu_tag;
            app.showCategoriesPane();
        });

        $('button[name="btn_cbi_class"]').off('click');
        $('button[name="btn_cbi_class"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.current_class_name = app.cbi_tag;
            app.showCategoriesPane();
        });

        $('button[name="btn_emp_skills"]').off('click');
        $('button[name="btn_emp_skills"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.current_class_id = 0;
            app.current_class_name = null;
            app.current_category_name = app.emp_tag;
            if (app.emp_tag_id != 0) {
                app.current_category_id = app.emp_tag_id;
                app.showSkillsPane();
            } else {
                app.callWebservice(
					'local_empskill_ws_get_tag_id',
					{
					    tag_rawname: app.emp_tag
					},
					function (data) {
					    if (data.length < 1) {
					        app.showErrorDialog('Error getting employability tag id');
					        $('#pane_classes button').prop('disabled', false);
					    } else {
					        app.emp_tag_id = data.tag_id;
					        app.current_category_id = app.emp_tag_id;
					        app.showSkillsPane();
					    }
					},
					function (data) {
					    app.showErrorDialog('Error getting employability tag id');
					    $('#pane_classes button').prop('disabled', false);
					}
				);
            }
        });

        $('button[name="btn_get_stats"]').off('click');
        $('button[name="btn_get_stats"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            if (app.emp_tag_id != 0) {
                app.current_category_id = app.emp_tag_id;
                if (app.user_faculties == 1) {
                    app.showFacultyMenuPane();
                } else if (app.user_faculties) {
                    app.showFacultiesPane();
                }
            } else {
                app.callWebservice(
					'local_empskill_ws_get_tag_id',
					{
					    tag_rawname: app.emp_tag
					},
					function (data) {
					    if (data.length < 1) {
					        app.showErrorDialog('Error getting employability tag id');
					        $('#pane_classes button').prop('disabled', false);
					    } else {
					        app.emp_tag_id = data.tag_id;
					        app.current_category_id = app.emp_tag_id;
					        if (app.user_faculties == 1) {
					            app.showFacultyMenuPane();
					        } else if (app.user_faculties) {
					            app.showFacultiesPane();
					        }
					    }
					},
					function (data) {
					    app.showErrorDialog('Error getting employability tag id');
					    $('#pane_classes button').prop('disabled', false);
					}
				);
            }
        });

        $('button[name="btn_switch_theme"]').off('click'); // Show previous handler
        $('button[name="btn_switch_theme"]').on('click', function () {
            app.showThemesPane();
        });

        app.user_faculties = 0;
        app.current_faculty_id = 0;
        app.current_faculty_name = null;
        app.callWebservice(
			'local_empskill_ws_get_faculties',
			{},
			function (data) {
			    app.user_faculties = data.length;
			    if (app.user_faculties) {
			        $('#btn_get_stats').show();
			        if (app.user_faculties == 1) {
			            app.current_faculty_id = data[0].faculty_id;
			            app.current_faculty_name = data[0].faculty_name;
			        }
			    }
			    $('#pane_classes').show();
			    app.setPaneFooterHeight('pane_classes');
			},
			function (data) {
			    app.showErrorDialog('Error getting faculties list');
			}
		);
    },

    showThemesPane: function () {

        var themes;
        
        themes = app.theme_names.length; // The number of valid themes
        
        app.hideAllPanes();

        app.current_pane = 'themes';
        app.showTitle('Colour Themes');

        $('#btn_logout').show();
        $('#btn_back').show();

        $('#btn_refresh').hide();

        if (themes < 1) {
            $('button[name="btn_theme_0"]').hide();
        } else {
            $('button[name="btn_theme_0"]').html(app.theme_names[0]);
            $('button[name="btn_theme_0"]').show();
        }

        if (themes < 2) {
            $('button[name="btn_theme_1"]').hide();
        } else {
            $('button[name="btn_theme_1"]').html(app.theme_names[1]);
            $('button[name="btn_theme_1"]').show();
        }

        if (themes < 3) {
            $('button[name="btn_theme_2"]').hide();
        } else {
            $('button[name="btn_theme_2"]').html(app.theme_names[2]);
            $('button[name="btn_theme_2"]').show();
        }

        if (themes < 4) {
            $('button[name="btn_theme_3"]').hide();
        } else {
            $('button[name="btn_theme_3"]').html(app.theme_names[3]);
            $('button[name="btn_theme_3"]').show();
        }

        if (themes < 5) {
            $('button[name="btn_theme_4"]').hide();
        } else {
            $('button[name="btn_theme_4"]').html(app.theme_names[4]);
            $('button[name="btn_theme_4"]').show();
        }

        if (themes < 6) {
            $('button[name="btn_theme_5"]').hide();
        } else {
            $('button[name="btn_theme_5"]').html(app.theme_names[5]);
            $('button[name="btn_theme_5"]').show();
        }

        if (themes < 7) {
            $('button[name="btn_theme_6"]').hide();
        } else {
            $('button[name="btn_theme_6"]').html(app.theme_names[6]);
            $('button[name="btn_theme_6"]').show();
        }

        if (themes < 8) {
            $('button[name="btn_theme_7"]').hide();
        } else {
            $('button[name="btn_theme_7"]').html(app.theme_names[7]);
            $('button[name="btn_theme_7"]').show();
        }

        if (themes < 9) {
            $('button[name="btn_theme_8"]').hide();
        } else {
            $('button[name="btn_theme_8"]').html(app.theme_names[8]);
            $('button[name="btn_theme_8"]').show();
        }

        if (themes < 10) {
            $('button[name="btn_theme_9"]').hide();
        } else {
            $('button[name="btn_theme_9"]').html(app.theme_names[9]);
            $('button[name="btn_theme_9"]').show();
        }

        $('#pane_classes button').prop('disabled', false);

        $('button[name="btn_theme_0"]').off('click');
        $('button[name="btn_theme_0"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[0]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_1"]').off('click');
        $('button[name="btn_theme_1"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[1]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_2"]').off('click');
        $('button[name="btn_theme_2"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[2]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_3"]').off('click');
        $('button[name="btn_theme_3"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[3]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_4"]').off('click');
        $('button[name="btn_theme_4"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[4]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_5"]').off('click');
        $('button[name="btn_theme_5"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[5]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_6"]').off('click');
        $('button[name="btn_theme_6"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[6]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_7"]').off('click');
        $('button[name="btn_theme_7"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[7]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_8"]').off('click');
        $('button[name="btn_theme_8"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[8]);
            app.showThemesPane();
        });

        $('button[name="btn_theme_9"]').off('click');
        $('button[name="btn_theme_9"]').on('click', function () {
            $('#pane_classes button').prop('disabled', true);
            app.switchTheme(app.theme_names[9]);
            app.showThemesPane();
        });

        $('#pane_themes').show();
    },

    showFacultiesPane: function () {
        app.hideAllPanes();

        app.current_pane = 'faculties';
        app.showTitle('Faculty Statistics');

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getFacultiesList);

        $('#pane_faculties').show();

        app.getFacultiesList();
    },

    getFacultiesList: function () {
        $('#btn_refresh').hide();

        $('#list_faculties').empty();
        $('#no_faculties').hide();
        $('#loading_faculties').show();

        app.callWebservice(
			'local_empskill_ws_get_faculties',
			{},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_faculties').hide();

			    if (data.length < 1) {
			        $('#no_faculties').show();
			        return;
			    }

			    $.each(data, function (i, faculty) {
			        var li = $('<li>' + faculty.faculty_name + '</li>');
			        li.data('faculty_id', faculty.faculty_id);
			        li.data('faculty_name', faculty.faculty_name);
			        $('#list_faculties').append(li);
			    });
			    $('#list_faculties li').on('click', function () {
			        if (app.platform == 'ios') {
			            $('body').scrollTop(0);
			        }
			        var faculty_id = $(this).data('faculty_id');
			        var faculty_name = $(this).data('faculty_name');
			        app.current_faculty_id = faculty_id;
			        app.current_faculty_name = faculty_name;
			        app.showFacultyMenuPane();
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_faculties').hide();

			    app.showErrorDialog('Error getting faculty list');
			}
		);
    },

    showFacultyMenuPane: function () {
        app.hideAllPanes();

        app.current_pane = 'faculty_menu';
        app.showTitle(app.current_faculty_name);

        $('#btn_back').show();

        $('#faculty_menu').empty();
        var li = $('<li>Monthly Blog Entry Averages</li>');
        li.data('menu_option', 'faculty_stats');
        $('#faculty_menu').append(li);
        li = $('<li>Module/Skill Percentages</li>');
        li.data('menu_option', 'course_stats');
        $('#faculty_menu').append(li);
        $('#faculty_menu li').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            var menu_option = $(this).data('menu_option');
            if (menu_option == 'faculty_stats') {
                app.showFacultyStatsPane();
            } else {
                app.showCourseStatsPane();
            }
        });

        $('#pane_faculty_menu').show();
    },

    showFacultyStatsPane: function () {
        app.hideAllPanes();

        app.current_pane = 'faculty_stats';
        app.showTitle(app.current_faculty_name);
        $('#faculty_stats_guide').empty();
        $('#faculty_stats_guide').hide();

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getFacultyStatsList);

        $('#pane_faculty_stats').show();

        app.getFacultyStatsList();
    },

    getFacultyStatsList: function () {
        $('#btn_refresh').hide();

        $('#list_faculty_stats').empty();
        $('#no_faculty_stats').hide();
        $('#loading_faculty_stats').show();

        app.callWebservice(
			'local_empskill_ws_get_faculty_stats',
            {
                faculty_id: app.current_faculty_id,
                category_id: app.current_category_id
            },
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_faculty_stats').hide();

			    if (data.length < 1) {
			        $('#no_faculty_stats').show();
			        return;
			    }

			    $('#faculty_stats_guide').html('Average blog entries per current student /<br />Average module-associated blog entries per current student');
			    $('#faculty_stats_guide').show();

			    $.each(data, function (i, month) {
			        var li = $('<li>' + month.month_name
                        + '<span class="percent">' + (month.month_posts / 10) + '/' + (month.month_associations / 10) + '</span></li>');
			        $('#list_faculty_stats').append(li);
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_faculty_stats').hide();

			    app.showErrorDialog('Error getting faculty statistics');
			}
		);
    },

    showCourseStatsPane: function () {
        app.hideAllPanes();

        app.current_pane = 'course_stats';
        app.showTitle(app.current_faculty_name);
        $('#course_stats_guide').empty();
        $('#course_stats_guide').hide();

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getCourseStatsList);

        $('button[name="btn_list_faculty"]').off('click'); // Show previous handler
        $('button[name="btn_list_faculty"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            app.current_course_id = 0;
            app.current_course_name = null;
            app.showSkillStatsPane();
        });

        $('#pane_course_stats').show();

        app.setPaneFooterHeight('pane_course_stats');

        app.getCourseStatsList();
    },

    getCourseStatsList: function () {
        $('#btn_refresh').hide();

        $('#list_course_stats').empty();
        $('#no_course_stats').hide();
        $('#loading_course_stats').show();

        app.callWebservice(
			'local_empskill_ws_get_course_stats',
            {
                faculty_id: app.current_faculty_id,
                category_id: app.current_category_id
            },
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_course_stats').hide();

			    if (data.length < 1) {
			        $('#no_course_stats').show();
			        return;
			    }

			    $('#course_stats_guide').html('Current students that have blogged about their employability skills at some time (%) /<br />Blog entries by current students that have been associated with this module (%)');
			    $('#course_stats_guide').show();

			    $.each(data, function (i, course) {
			        var name = course.course_name;
			        if (name.length > 30) {
			            var middle = app.findMiddle(name);
			            name = name.substr(0, middle) + '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + name.substr(middle + 1);
			        }
			        var li = $('<li>' + course.course_number + ': ' + name + '<span class="percent">' + course.course_bloggers + '/' + course.course_associations + '</span></li>');
			        li.data('course_id', course.course_id);
			        li.data('course_name', course.course_number + ': ' + course.course_name);
			        $('#list_course_stats').append(li);
			    });
			    $('#list_course_stats li').on('click', function () {
			        if (app.platform == 'ios') {
			            $('body').scrollTop(0);
			        }
			        var course_id = $(this).data('course_id');
			        var course_name = $(this).data('course_name');
			        app.current_course_id = course_id;
			        app.current_course_name = course_name;
			        app.showSkillStatsPane();
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_course_stats').hide();

			    app.showErrorDialog('Error getting course list');
			}
		);
    },

    showSkillStatsPane: function () {
        app.hideAllPanes();

        app.current_pane = 'skill_stats';
        if (app.current_course_id)
            app.showTitle(app.current_course_name);
        else
            app.showTitle(app.current_faculty_name);

        $('#skill_stats_guide').empty();
        $('#skill_stats_guide').hide();

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getSkillStatsList);

        $('#pane_skill_stats').show();

        app.getSkillStatsList();
    },

    getSkillStatsList: function () {
        $('#btn_refresh').hide();

        $('#list_skill_stats').empty();
        $('#no_skill_stats').hide();
        $('#loading_skill_stats').show();

        app.callWebservice(
			'local_empskill_ws_get_skill_stats',
            {
                faculty_id: app.current_faculty_id,
                category_id: app.current_category_id,
                course_id: app.current_course_id
            },
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_skill_stats').hide();

			    if (data.length < 1) {
			        $('#no_skill_stats').show();
			        return;
			    }

			    if (app.current_course_id)
			        $('#skill_stats_guide').html('Current module students that have blogged about this skill at some time (%) /<br />Blog entries by current module students that have been associated with this module (%)');
			    else
			        $('#skill_stats_guide').html('Current faculty students that have blogged about this skill at some time (%) /<br />Blog entries by current faculty students that have been associated with a module (%)');
			    $('#skill_stats_guide').show();

			    $.each(data, function (i, skill) {
			        var name = skill.skill_name;
			        if (name.length > 30) {
			            var middle = app.findMiddle(name);
			            name = name.substr(0, middle) + '<br />' + name.substr(middle + 1);
			        }
			        var li = $('<li>' + name + '<span class="percent">' + skill.skill_bloggers + '/' + skill.skill_associations + '</span></li>');
			        $('#list_skill_stats').append(li);
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_skill_stats').hide();

			    app.showErrorDialog('Error getting skill list');
			}
		);
    },

    showCategoriesPane: function () {
        app.hideAllPanes();

        app.current_pane = 'categories';
        if (app.current_class_name == app.obu_tag)
            app.showTitle('Brookes Attribute');
        else
            app.showTitle('CBI/NUS Category');

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getCategoriesList);

        $('#pane_categories').show();

        app.getCategoriesList();
    },

    getCategoriesList: function () {
        $('#btn_refresh').hide();

        $('#list_categories').empty();
        $('#no_categories').hide();
        $('#loading_categories').show();

        app.callWebservice(
			'local_empskill_ws_get_skill_categories',
			{
			    class_name: app.current_class_name
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_categories').hide();

			    if (data.length < 1) {
			        $('#no_categories').show();
			        return;
			    }

			    $.each(data, function (i, category) {
			        var li = $('<li>' + category.category_name + '</li>');
			        li.data('class_id', category.class_id);
			        li.data('category_id', category.category_id);
			        li.data('category_name', category.category_name);
			        $('#list_categories').append(li);
			    });
			    $('#list_categories li').on('click', function () {
			        if (app.platform == 'ios') {
			            $('body').scrollTop(0);
			        }
			        var class_id = $(this).data('class_id');
			        var category_id = $(this).data('category_id');
			        var category_name = $(this).data('category_name');
			        app.current_class_id = class_id;
			        app.current_category_id = category_id;
			        app.current_category_name = category_name;
			        app.showSkillsPane();
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_categories').hide();

			    app.showErrorDialog('Error getting category list');
			}
		);
    },

    showSkillsPane: function () {
        app.hideAllPanes();

        app.current_pane = 'skills';
        app.showTitle(app.current_category_name);

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getSkillsList);

        $('button[name="btn_list_all"]').off('click'); // Show previous handler
        $('button[name="btn_list_all"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            app.current_skill_id = 0;
            app.current_skill_name = null;
            app.showEntriesPane();
        });

        $('#pane_skills').show();

        app.setPaneFooterHeight('pane_skills');

        app.getSkillsList();
    },

    getSkillsList: function () {
        $('#btn_refresh').hide();

        $('#list_skills').empty();
        $('#no_skills').hide();
        $('#loading_skills').show();

        app.callWebservice(
			'local_empskill_ws_get_skills',
			{
			    class_id: app.current_class_id,
			    category_id: app.current_category_id
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_skills').hide();

			    if (data.length < 1) {
			        $('#no_skills').show();
			    }

			    $.each(data, function (i, skill) {
			        var li = $('<li>' + skill.skill_name + '<span class="count">' + skill.skill_entries + '</span></li>');
			        li.data('skill_id', skill.skill_id);
			        $('#list_skills').append(li);
			    });
			    $('#list_skills li').on('click', function () {
			        app.current_skill_id = $(this).data('skill_id');
			        app.showEntriesPane();
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_skills').hide();

			    app.showErrorDialog('Error getting skills list');
			}
		);
    },

    showEntriesPane: function () {
        app.hideAllPanes();

        app.current_pane = 'entries';

        $('#pane_title').empty();
        $('#skill_description').empty();
        $('#skill_description').hide();
        $('#no_entries').hide();
        $('#list_entries').empty();

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getEntriesList);

        if (app.current_skill_id == 0) {
            $('#new_entry').hide();
        } else {
            $('#new_entry').show();
            $('button[name="btn_new_entry"]').off('click'); // Show previous handler
            $('button[name="btn_new_entry"]').on('click', function () {
                if (app.platform == 'ios') {
                    $('body').scrollTop(0);
                }
                app.current_entry_id = 0;
                app.showAddEditPane();
            });
        }

        $('#pane_entries').show();

        app.setPaneFooterHeight('pane_entries');

        var tag_id = 0;
        if (app.current_skill_id > 0) {
            tag_id = app.current_skill_id;
        } else if (app.current_category_id > 0) {
            tag_id = app.current_category_id;
        } else {
            tag_id = app.current_class_id;
        }

        app.callWebservice(
			'local_empskill_ws_get_tag_name',
			{
			    tag_id: tag_id
			},
			function (data) {
			    if (data.length < 1) {
			        app.showErrorDialog('Error getting tag');
			    }
			    app.showTitle(data.tag_name);
			    if (app.current_skill_id > 0) {
			        app.current_skill_name = data.tag_name;
			        app.current_skill_description = data.tag_description;
			        if (app.current_skill_description) {
			            $('#skill_description').html(app.current_skill_description.replace(/\n/g, "&nbsp;<br />"));
			            $('#skill_description').show();
			        }
			    }
			    app.getEntriesList();
			},
			function (data) {
			    app.showErrorDialog('Error getting skill');
			}
		);
    },

    getEntriesList: function () {
        $('#btn_refresh').hide();

        $('#list_entries').empty();

        $('#no_entries').hide();

        $('#loading_entries').show();

        app.callWebservice(
			'local_empskill_ws_get_entries',
			{
			    class_id: app.current_class_id,
			    category_id: app.current_category_id,
			    skill_id: app.current_skill_id
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_entries').hide();

			    if (data.length < 1) {
			        $('#no_entries').show();
			    }

			    $.each(data, function (i, entry) {
			        var li = $('<li>' + entry.entry_title + '<br /><span class="listdate">' + entry.entry_date + '</span></li>');
			        li.data('entry_id', entry.entry_id);
			        $('#list_entries').append(li);
			    });
			    $('#list_entries li').on('click', function () {
			        app.current_entry_id = $(this).data('entry_id');
			        app.showEntryPane();
			    });
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_entries').hide();

			    app.showErrorDialog('Error getting entries list');
			}
		);
    },

    showAddEditPane: function () {
        app.hideAllPanes();

        $('#skill_guide').empty();
        $('#skill_guide').hide();

        app.current_pane = 'add_edit';
        if (app.current_skill_id) {
            app.showTitle(app.current_skill_name);
            if (app.current_skill_description) {
                $('#skill_guide').html(app.current_skill_description.replace(/\n/g, "&nbsp;<br />"));
                $('#skill_guide').show();
            }
        } else if (app.current_category_id) {
            app.showTitle(app.current_category_name);
        } else {
            app.showTitle(app.current_class_name);
        }

        $('#btn_back').show();

        $('#btn_refresh').hide();

        $('input[name="entry_title"]').val('');
        $('select[name="entry_course"]')
			.find('option')
			.remove()
			.end()
			.append('<option value="0" selected="selected">Not Applicable/Earlier Module</option>')
			.val('0');
        $('textarea[name="entry_body"]').val('');
        $('input[name="entry_link"]').val('');
        $('input[name="entry_private"]').prop('checked', true);
        $('#entry_private').hide(); // To avoid confusion because, currently, all blog entries are private anyway

        $('button[name="btn_save_entry"]').prop('disabled', false);
        $('button[name="btn_save_entry"]').html('Save');

        $('button[name="btn_save_entry"]').off('click');
        $('button[name="btn_save_entry"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            var entry_title = $('input[name="entry_title"]').val();
            var entry_course_id = $('select[name="entry_course"]').val();
            var entry_body = $('textarea[name="entry_body"]').val();
            var entry_link = $('input[name="entry_link"]').val();
            var entry_private = $('input[name="entry_private"]').prop('checked');
            if (entry_private) {
                entry_private = 1;
            } else {
                entry_private = 0;
            }

            if (!entry_title) {
                app.showErrorDialog('Entry title must be entered');
                return;
            }

            if (!entry_body) {
                app.showErrorDialog('Entry body must be entered');
                return;
            }

            $('button[name="btn_save_entry"]').prop('disabled', true);
            $('button[name="btn_save_entry"]').html('Saving...');

            app.callWebservice(
				'local_empskill_ws_save_entry',
				{
				    entry_id: app.current_entry_id,
				    entry_title: entry_title,
				    entry_course_id: entry_course_id,
				    entry_body: entry_body,
				    entry_link: entry_link,
				    entry_private: entry_private,
				    entry_tag_1: app.emp_tag,
				    entry_tag_2: app.current_skill_name
				},
				function (data) {
				    app.current_entry_id = data.entry_id;
				    app.showEntriesPane();
				},
				function (data) {
				    console.log(data.debuginfo);
				    $('button[name="btn_save_entry"]').prop('disabled', false);
				    $('button[name="btn_save_entry"]').html('Save');
				    app.showErrorDialog('Error saving blog entry');
				}
			);
        });

        $('#pane_add_edit').show();

        if (app.current_entry_id) {
            app.getCurrentEntry();
        } else {
            app.current_course_id = 0;
            app.getCoursesList();
        }
    },

    getCurrentEntry: function () {
        $('#no_current').hide();

        app.callWebservice(
			'local_empskill_ws_get_entry',
			{
			    entry_id: app.current_entry_id
			},
			function (data) {

			    if (data.length < 1) {
			        $('#no_current').show();
			    }

			    $('input[name="entry_title"]').val(data.entry_title);
			    app.current_course_id = data.entry_course_id;
			    if (app.current_course_id) {
			        var option = $('<option value="' + app.current_course_id + '" selected="selected">' + data.entry_course_number + ': ' + data.entry_course_name + '</option>');
			        $('select[name="entry_course"]')
						.append(option)
						.val(app.current_course_id);
			    }
			    $('textarea[name="entry_body"]').val(data.entry_body);
			    $('input[name="entry_link"]').val(data.entry_link);
			    $('input[name="entry_private"]').prop('checked', data.entry_private);
			    app.getCoursesList();
			},
			function (data) {
			    app.showErrorDialog('Error getting blog entry');
			}
		);
    },

    getCoursesList: function () {
        app.callWebservice(
			'local_empskill_ws_get_current_courses',
			{
			    category_id: 0
			},
			function (data) {
			    $.each(data, function (i, course) {
			        if (course.course_id != app.current_course_id) {
			            var option = $('<option value="' + course.course_id + '">' + course.course_number + ': ' + course.course_name + '</option>');
			            $('select[name="entry_course"]').append(option);
			        }
			    });
			},
			function (data) { }
		);
    },

    showEntryPane: function () {
        app.hideAllPanes();

        app.current_pane = 'entry';

        if (app.current_skill_id) {
            app.showTitle(app.current_skill_name);
        } else if (app.current_category_id) {
            app.showTitle(app.current_category_name);
        } else {
            app.showTitle(app.current_class_name);
        }

        $('#entry_course').hide();
        $('#entry_link').hide();

        $('#btn_back').show();

        $('#btn_refresh').show();
        $('#btn_refresh').off('click');
        $('#btn_refresh').on('click', app.getEntry);

        $('button[name="btn_edit_entry"]').show();
        $('button[name="btn_edit_entry"]').off('click');
        $('button[name="btn_edit_entry"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            app.showAddEditPane();
        });

        $('button[name="btn_delete_entry"]').show();
        $('button[name="btn_delete_entry"]').off('click');
        $('button[name="btn_delete_entry"]').on('click', function () {
            if (app.platform == 'ios') {
                $('body').scrollTop(0);
            }
            app.showConfirmEntryDeletePane();
        });

        $('#pane_entry').show();

        app.setPaneFooterHeight('pane_entry');

        app.getEntry();
    },

    getEntry: function () {
        $('#btn_refresh').hide();

        $('#entry_title').empty();
        $('#entry_date').empty();
        $('#entry_course').empty();
        $('#entry_body').empty();
        $('#entry_link').empty();
        $('#loading_entry').show();
        $('#no_entry').hide();

        app.callWebservice(
			'local_empskill_ws_get_entry',
			{
			    entry_id: app.current_entry_id
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_entry').hide();

			    if (data.length < 1) {
			        $('#no_entry').show();
			    }

			    $('#entry_title').html(data.entry_title);
			    $('#entry_date').html(data.entry_date);
			    if (data.entry_course_id) {
			        course = data.entry_course_number + ': ' + data.entry_course_name;
			        $('#entry_course').html(course);
			        $('#entry_course').show();
			    }
			    $('#entry_body').html(data.entry_body.replace(/\n/g, "&nbsp;<br />"));
			    if (data.entry_link) {
			        var link = '';
			        if (app.platform == "android") {
			            link = '<a onclick="navigator.app.loadUrl(\'' + data.entry_link + '\', { openExternal:true });" href="#">' + data.entry_link + '</a>';
			        } else {
			            link = '<a onclick="window.open(\'' + data.entry_link + '\', \'_system\');" href="#">' + data.entry_link + '</a>';
			        }
			        $('#entry_link').html(link);
			        $('#entry_link').show();
			    }
			},
			function (data) {
			    $('#btn_refresh').show();

			    $('#loading_entry').hide();

			    app.showErrorDialog('Error getting blog entry');
			}
		);
    },

    showConfirmEntryDeletePane: function () {
        app.hideAllPanes();

        app.current_pane = 'delete_entry';
        app.showTitle('Delete entry?');

        $('#btn_back').show();

        $('#btn_refresh').hide();

        $('#pane_confirm_entry_delete button').prop('disabled', false);

        $('button[name="btn_delete_yes"]').off('click');
        $('button[name="btn_delete_yes"]').on('click', function () {
            $('#pane_confirm_entry_delete button').prop('disabled', true);

            app.callWebservice(
				'local_empskill_ws_delete_entry',
				{
				    entry_id: app.current_entry_id
				},
				function (data) {
				    app.showEntriesPane();
				},
				function (data) {
				    $('#pane_confirm_entry_delete button').prop('disabled', false);

				    app.showErrorDialog('Error deleting blog entry');
				}
			);
        });

        $('button[name="btn_delete_no"]').off('click');
        $('button[name="btn_delete_no"]').on('click', function () {
            app.showEntryPane();
        });

        $('#pane_confirm_entry_delete').show();
    },

    getThemes: function () {
        var themes, link, links;

        themes = 0;
        links = document.getElementsByTagName('link');
        for (link = 0; link < links.length; link++) {
            if ((links[link].rel.indexOf('stylesheet') != -1) && links[link].title) {
                app.theme_names[themes++] = links[link].title;
            }
        }
    },

    switchTheme: function (theme) {
        var link, links;

        // Validate the theme (may have been withdrawn)
        if (app.theme_names.indexOf(theme) >= 0) {
            app.theme = theme;
        } else {
            app.theme = app.theme_names[0]; // Use the default if no theme given (or not found)
        }

        // Store the theme for next time
        window.localStorage.setItem(app.service + '_theme', app.theme);

        links = document.getElementsByTagName('link');
        for (link = 0; link < links.length; link++) {
            if ((links[link].rel.indexOf('stylesheet') != -1) && links[link].title) {
                if (links[link].title === app.theme) {
                    links[link].disabled = false;
                } else {
                    links[link].disabled = true;
                }
            }
        }
    },

    findMiddle: function (text) {
        var middle = Math.floor(text.length / 2);
        var previous = text.lastIndexOf(' ', middle);
        var next = text.indexOf(' ', middle + 1);

        if (previous < 0) {
            if (next < 0) {
                middle = text.length;
            } else {
                middle = after;
            }
        } else if (next < 0) {
            middle = previous;
        } else if ((middle - previous) < (next - middle)) {
            middle = previous;
        } else {
            middle = next;
        }

        return middle;
    }
};
