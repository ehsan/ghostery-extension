/**
 * Configuration Data Class
 *
 * This module provides an interface for managing User Configuration
 * properties. All Conf properties (aka static class variables) are
 * attached to Conf.prototype. Method init is called only once on startup
 * or when extension is being installed/updated
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint no-use-before-define: 0 */

import globals from './Globals';
import { prefsGet, log } from '../utils/common';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
/**
 * Class for handling user configuration properties synchronously.
 *
 * For persistence user settings are stored in Chrome Storage.
 * However, access to Storage is asynchronous. ConfData makes an
 * in-memory copy of Storage content on startup, which allows to
 * manipulate properties synchronously during the session. Changed
 * properties are ultimately saved back to Storage asynchronously.
 * @memberOf  BackgroundClasses
 */
class ConfData {
	constructor() {
		// paused_blocking, language and SYNC_SET do not get persisted
		this.language = this._getDefaultLanguage();
		this.DONT_PERSIST_SET = new Set(globals.DONT_PERSIST_ARRAY);
		this.SYNC_SET = new Set(globals.SYNC_ARRAY);
	}

	/**
	 * Reads all properties from Storage and sets them as
	 * prototyped properties of the ConfData object.
	 * This method is called once on startup.
	 */
	init() {
		return prefsGet().then((data) => {
			const nowTime = Number(new Date().getTime());
			const _initProperty = (name, value) => {
				if (data[name] === null || typeof (data[name]) === 'undefined') {
					data[name] = value;
					_setProp(name, value);
				}
				this[name] = data[name];
			};
			const _setProp = (name, value) => {
				if (!globals.INIT_COMPLETE) {
					globals.initProps[name] = value;
				}
			};

			// Transfer legacy previous version property to new name
			const { previous_version } = data;
			if (data.previous_version === null || typeof (data.previous_version) === 'undefined') {
				if (data.previousVersion) {
					data.previous_version = data.previousVersion;
					chrome.storage.local.remove('previousVersion');
					delete data.previousVersion;
				}
			}
			this.previous_version = data.previous_version || '';

			if (previous_version !== this.previous_version) {
				_setProp('previous_version', this.previous_version);
			}

			// simple props
			_initProperty('alert_bubble_pos', 'br');
			_initProperty('alert_bubble_timeout', 15);
			_initProperty('alert_expanded', false);
			_initProperty('block_by_default', false);
			_initProperty('bugs_last_checked', 0);
			_initProperty('bugs_last_updated', nowTime);
			_initProperty('cmp_version', 0);
			_initProperty('enable_ad_block', false);
			_initProperty('enable_anti_tracking', false);
			_initProperty('enable_autoupdate', false);
			_initProperty('enable_click2play', false);
			_initProperty('enable_click2play_social', false);
			_initProperty('enable_human_web', false);
			_initProperty('enable_metrics', false);
			_initProperty('enable_offers', false);
			_initProperty('enable_smart_block', true);
			_initProperty('expand_all_trackers', false);
			_initProperty('hide_alert_trusted', false);
			_initProperty('ignore_first_party', true);
			_initProperty('import_callout_dismissed', true);
			_initProperty('install_random_number', 0);
			_initProperty('install_date', 0);
			_initProperty('is_expanded', false);
			_initProperty('is_expert', false);
			_initProperty('last_cmp_date', 0);
			_initProperty('notify_library_updates', false);
			_initProperty('notify_upgrade_updates', true);
			_initProperty('settings_last_imported', 0);
			_initProperty('settings_last_exported', 0);
			_initProperty('show_alert', false);
			_initProperty('show_badge', true);
			_initProperty('show_cmp', true);
			_initProperty('show_tracker_urls', true);
			_initProperty('toggle_individual_trackers', true);
			_initProperty('setup_step', 0);
			_initProperty('setup_path', 0);
			_initProperty('setup_block', 1);

			// Complex props
			_initProperty('bugs', {});
			_initProperty('click2play', {});
			_initProperty('cmp_data', []);
			_initProperty('compatibility', {});
			_initProperty('metrics', {});
			_initProperty('new_app_ids', []);
			_initProperty('selected_app_ids', {});
			_initProperty('site_blacklist', []);
			_initProperty('site_specific_blocks', {});
			_initProperty('site_specific_unblocks', {});
			_initProperty('site_whitelist', []);
			_initProperty('surrogates', {});
			_initProperty('version_history', []);
			_initProperty('login_info', {
				logged_in: false,
				email: '',
				user_token: '',
				decoded_user_token: {},
				is_validated: false
			});
			_initProperty('reload_banner_status', {
				dismissals: [],
				show_time: nowTime,
				show: true
			});
			_initProperty('trackers_banner_status', {
				dismissals: [],
				show_time: nowTime,
				show: true
			});
		});
	}

	_getDefaultLanguage() {
		const SUPPORTED_LANGUAGES = {
			de: 'Deutsch',
			en: 'English',
			es: 'español',
			fr: 'Français',
			hu: 'magyar',
			it: 'Italiano',
			ja: '日本語',
			ko: '한국어',
			nl: 'Nederlands',
			pl: 'Polski',
			pt_BR: 'português',
			ru: 'Русский',
			zh_CN: '简体中文',
			zh_TW: '繁體中文'
		};

		let lang = window.navigator.language.replace('-', '_');

		if (SUPPORTED_LANGUAGES.hasOwnProperty(lang)) {
			return lang;
		}

		lang = lang.slice(0, 2);
		if (SUPPORTED_LANGUAGES.hasOwnProperty(lang)) {
			return lang;
		}

		return 'en';
	}
}

// return the class as a singleton
export default new ConfData();
