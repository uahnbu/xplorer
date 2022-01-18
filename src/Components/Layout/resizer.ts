import Storage from '../../Api/storage';

const SENSOR = 10;
const MINSIZE = 70;
const MINSNAP = 220;

let sidebar: HTMLElement;
let settingsSidebar: HTMLElement;
let xplorerBrand: HTMLElement;
let appearance: any;

export const resizeSidebar = function (size?: string) {
	if (!size) {
		if (sidebar.offsetWidth !== MINSIZE) size = MINSIZE + 'px';
		else size = appearance.expandedSidebarWidth || '250px';
	}
	if (size === MINSIZE + 'px') {
		sidebar.classList.add('sidebar-minimized');
		settingsSidebar.classList.add('sidebar-minimized');
		const imgSrc = require('../../Icon/extension/xplorer.svg');
		xplorerBrand.innerHTML = `<img src=${imgSrc} alt="xplorer" />`;
	} else {
		sidebar.classList.remove('sidebar-minimized');
		settingsSidebar.classList.remove('sidebar-minimized');
		xplorerBrand.innerHTML = 'Xplorer';
	}
	sidebar.style.flexBasis = size;
	settingsSidebar.style.flexBasis = size;
	appearance.sidebarWidth = size;
};

/**
 * Sidebar resizer initalization
 * @returns {Promise<void>}
 */
export const Resizer = async (): Promise<void> => {
	sidebar = document.querySelector<HTMLElement>('.sidebar');
	settingsSidebar = document.querySelector<HTMLElement>('.settings-sidebar');
	xplorerBrand = document.querySelector<HTMLElement>('.xplorer-brand');
	appearance = (await Storage.get('appearance')) || {};
	resizeSidebar(appearance.sidebarWidth ?? '250px');

	let resizing = false;

	document.addEventListener('mouseup', () => (resizing = false));

	document.addEventListener('mousedown', ({ clientX: mx }) => {
		const { offsetWidth: w } = sidebar;
		resizing = Math.abs(w - mx) < SENSOR;
	});

	document.addEventListener('mousemove', (event) => {
		type MouseMoveEvent = MouseEvent & { target: HTMLElement };
		const { clientX: mx, clientY: my, target } = event as MouseMoveEvent;
		if (resizing) {
			let size = mx + 'px';
			if (mx < MINSNAP) size = MINSIZE + 'px';
			else appearance.expandedSidebarWidth = size;
			resizeSidebar(size);
			Storage.set('appearance', appearance);
		}
		if (sidebar.classList.contains('sidebar-minimized')) {
			const itemClasses = ['sidebar-item', 'drive-item'];
			if (itemClasses.some((c) => target.classList.contains(c))) {
				const sidebarText = target.querySelector<HTMLElement>('.sidebar-text');
				const { offsetTop: y, offsetHeight: h } = sidebarText;
				const root = document.documentElement;
				root.style.setProperty('--sidebar-text-y', my - y - h / 2 + 'px');
			}
		}
		const { offsetWidth: w } = sidebar;
		const modifier = Math.abs(w - mx) < SENSOR || resizing ? 'add' : 'remove';
		document.body.classList[modifier]('resize-horizontal');
	});
};
