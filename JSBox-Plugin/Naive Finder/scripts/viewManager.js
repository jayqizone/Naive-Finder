const { makeLocator, share } = require('./actionManager');
const locator = __proxy(makeLocator('itemList'));

const [statusBarHeight, indicatorHeight] = $device.isIphoneX && $device.info.screen.width < $device.info.screen.height ? [44, 34] : [20, 0];

const fm = $objc('NSFileManager').$defaultManager();
const mb = $objc('NSBundle').$mainBundle();

const BUNDLE_PATH = mb.$bundlePath().rawValue();
const APP_HOME = NSHomeDirectory().rawValue();
const APP_GROUP = fm.$containerURLForSecurityApplicationGroupIdentifier('group.jsbox.share').$path().rawValue();
const ICLOUD = '/private/var/mobile/Library/Mobile Documents/iCloud~app~cyan~jsbox/';

const FORWARD_ICON = $objc('UIImage').$imageNamed('browser_forward').rawValue().resized($size(20, 20)).runtimeValue().$imageWithRenderingMode(2).rawValue();

let initiated = false;
let leftButton, rightButton;

let currentList = [];

module.exports = {
    createAddressBar,
    createItemList,
    createSuggestions,
    createDescriptionBar,
    createBackButton,
    locator,
    showSuggestions: __showSuggestions,
    refresh() {
        __goto(locator.currentPath);
    }
}

function createAddressBar() {
    return {
        type: 'input',
        props: {
            id: 'address',
            type: $kbType.search,
            placeholder: 'Input Path',
            enablesReturnKeyAutomatically: true,
            radius: 0,
            bgcolor: $rgb(...Array(3).fill(255 * 0.97))
        },
        layout(make, view) {
            make.top.inset(0);
            make.left.inset(0);
            make.right.inset(0);
            make.height.equalTo(40);
        },
        events: {
            didBeginEditing(sender) {
                if ($('suggestions').alpha) {
                    __showSuggestions(false);
                }
            },
            didEndEditing(sender) {
            },
            changed(sender) {
                if (sender.text === '') {
                    __showSuggestions(true);
                } else {
                    __showSuggestions(false);
                    $('itemList').data = currentList.filter(el => {
                        let pStr = NSString.$stringWithString(sender.text).$stringByStandardizingPath();
                        return el.parent === pStr.$stringByDeletingLastPathComponent().rawValue()
                            && el.name.toLowerCase().includes(pStr.$lastPathComponent().rawValue().toLowerCase())
                    });
                }
            },
            returned(sender) {
                __showSuggestions(false);
                sender.blur();
                __goto({ path: sender.text });
            }
        }
    }
}

function createItemList() {
    return {
        type: 'list',
        props: {
            id: 'itemList',
            separatorColor: $color('#DDDDDD'),
            template: {
                views: [
                    {
                        type: 'image',
                        props: {
                            id: 'icon',
                            bgcolor: $color('clear')
                        },
                        layout(make, view) {
                            make.top.inset(12);
                            make.left.inset(5);
                            make.size.equalTo($size(20, 20));
                        }
                    },
                    {
                        type: 'label',
                        props: {
                            id: 'item',
                            lineBreakMode: 5
                        },
                        layout(make, view) {
                            make.top.bottom.inset(0);
                            make.left.inset(40);
                            make.right.inset(80);
                        }
                    },
                    {
                        type: 'image',
                        props: {
                            id: 'forward',
                            tintColor: $color('#B7BEC6'),
                            bgcolor: $color('clear')
                        },
                        layout(make, view) {
                            make.top.inset(12);
                            make.right.inset(20);
                        }
                    },
                    {
                        type: 'label',
                        props: {
                            id: 'info',
                            align: $align.right,
                            textColor: $color('#666666')
                        },
                        layout(make, view) {
                            make.top.bottom.inset(0);
                            make.right.equalTo(view.prev.left);
                        }
                    }
                ]
            }
        },
        layout(make, view) {
            make.top.equalTo(view.prev.bottom);
            make.left.inset(15);
            make.right.inset(0);
            make.bottom.inset(40 + indicatorHeight);
        },
        events: {
            didSelect(sender, indexPath, data) {
                __goto(data);
            },
            async didLongPress(sender, indexPath, data) {
                $device.taptic(0);
                await share(data, locator, () => __goto(locator.currentPath));
            },
            didScroll({ tracking, contentOffset: { y } }) {
            },
            didEndDragging({ contentOffset: { y } }) {
                if (y < -50) {
                    $('address').focus();
                }
            }
        }
    }
}

function createSuggestions() {
    return {
        type: 'list',
        props: {
            id: 'suggestions',
            keyboardDismissMode: true,
            bgcolor: $color('white'),
            separatorColor: $color('clear'),
            template: {
                views: [
                    {
                        type: 'label',
                        props: {
                            id: 'title'
                        },
                        layout: function (make) {
                            make.top.inset(5);
                            make.left.inset(15);
                            make.right.inset(0);
                        }
                    }, {
                        type: 'label',
                        props: {
                            id: 'subtitle',
                            font: $font(10)
                        },
                        layout: function (make) {
                            make.left.inset(15);
                            make.right.inset(0);
                            make.bottom.inset(5);
                        }
                    }
                ]
            },
            data: [{
                title: 'Suggestions', rows: [
                    { title: { text: '/' }, path: '/' },
                    { title: { text: '/Library/Ringtones' }, path: '/Library/Ringtones' },
                    { title: { text: '/System/Library' }, path: '/System/Library' },
                    { title: { text: 'Bundle Path' }, subtitle: { text: BUNDLE_PATH }, path: BUNDLE_PATH },
                    { title: { text: 'App Home' }, subtitle: { text: APP_HOME }, path: APP_HOME },
                    { title: { text: 'App Group' }, subtitle: { text: APP_GROUP }, path: APP_GROUP },
                    { title: { text: 'iCloud' }, subtitle: { text: ICLOUD }, path: ICLOUD }
                ]
            }
            ]
        },
        layout(make, view) {
            make.top.equalTo(view.prev);
            make.left.inset(0);
            make.right.inset(0);
            make.bottom.inset(40 + indicatorHeight);
        },
        events: {
            didSelect(sender, indexPath, data) {
                __showSuggestions(false);
                $('address').blur();
                __goto(data);
            },
            didScroll({ tracking, contentOffset: { y } }) {
            },
            didEndDragging({ contentOffset: { y } }) {
                if (y < -50) {
                    $('address').focus();
                }
            }
        }
    }
}

function createDescriptionBar() {
    return {
        type: 'label',
        props: {
            id: 'description',
            textColor: $rgba(0, 0, 25, 0.22)
        },
        layout(make, view) {
            make.bottom.inset(indicatorHeight);
            make.left.inset(20);
            make.right.inset(0);
            make.height.equalTo(40);
        }
    }
}

function createBackButton() {
    return {
        type: 'view',
        views: [
            {
                type: 'view',
                props: {
                    radius: 25,
                    bgcolor: $color('white')
                },
                layout: $layout.fill
            },
            {
                type: 'image',
                props: {
                    id: 'backButton',
                    image: $file.read('assets/up.png').image.runtimeValue().$imageWithRenderingMode(2).rawValue(),
                    bgcolor: $color('clear')
                },
                layout: $layout.fill,
                events: {
                    tapped: function (sender) {
                        sender.animator.makeScale(0.8).makeOpacity(0.4).easeOut.thenAfter(0.05).makeScale(1.25).makeOpacity(1).easeIn.animate(0.05);

                        __goto({ direction: -1 });
                        if (locator.current < 0) {
                            __showSuggestions(true);
                        }
                    },
                    longPressed({ sender, location }) {
                        $device.taptic(0);
                        __showSuggestions(true);
                    },
                    touchesBegan: (sender, location) => {
                    },
                    touchesMoved: (sender, location) => {
                    },
                    touchesEnded: (sender, location) => {
                    }
                }
            }
        ],
        layout(make, view) {
            make.size.equalTo($size(50, 50));
            make.right.inset(25);
            make.bottom.inset(40);
        }
    }
}

function __goto(data) {
    if (!initiated) {
        initiated = true;
        leftButton = $ui.window.super.super.super.super.views[1].views[2].views[1].views[0];
        rightButton = $ui.window.super.super.super.super.views[1].views[2].views[1].views[2];
    }

    if (data.direction < 0 && locator.current < 0) {
        return;
    }
    if (data.direction > 0 && locator.current === locator.further) {
        return;
    }

    let result = locator.open(data);
    if (!result) {
        return;
    }

    if (result.clear) {
        $ui.title = 'Naive Finder';
        $('address').text = '';
        $('itemList').data = currentList = [];
        $('description').text = '';
        if (!locator.sourcePath.path) {
            leftButton.views[0].alpha = 0.5;
            rightButton.views[0].alpha = 0.5;
        }
        return;
    }

    let { path, name, exists, isDirectory,
        contentsOfDirectory: { list, dirCount, fileCount },
        access: { readable, writable, executable, deletable } } = result;

    if (exists) {
        if (isDirectory) {
            $ui.title = name;
            $('address').text = path + (name.endsWith('/') ? '' : '/');
            $('itemList').data = currentList = list.map(el => {
                let iconImage = null;
                let info = '';
                let forwardImage = null;
                if (el.isDirectory) {
                    iconImage = $objc('UIImage').$imageNamed('explorer-folder').rawValue();
                    if (el.itemCount !== undefined) {
                        info += el.itemCount;
                        forwardImage = FORWARD_ICON;
                    }
                } else {
                    iconImage = __getIconBySuffix(el.name.split('.').pop());
                    if (el.attrs) {
                        info = $objc('NSByteCountFormatter').$stringFromByteCount_countStyle(el.attrs.NSFileSize, 0).rawValue().replace('字节', 'B');
                    }
                }

                el.item = { text: el.name }
                el.icon = { image: iconImage }
                el.info = { text: info }
                el.forward = { image: forwardImage }

                return el;
            });
            $('itemList').contentOffset = locator.history[locator.current].contentOffset || $point(0, 0);
            if (readable) {
                $('description').text = `Directory: ${dirCount}    File:${fileCount}    W: ${writable}    E: ${executable}    D: ${deletable}`;
            } else {
                $('description').text = `Direcotory is not readable`;
            }

            if (locator.sourcePath.path) {
                const destPath = NSString.$stringWithString(locator.currentPath.path).$stringByAppendingPathComponent(locator.sourcePath.name).rawValue();
                if (locator.currentPath.access.writable && locator.sourcePath.path !== destPath) {
                    leftButton.views[1].alpha = 1;
                    rightButton.views[1].alpha = locator.sourcePath.access.deletable ? 1 : 0.5;
                } else {
                    leftButton.views[1].alpha = 0.5;
                    rightButton.views[1].alpha = 0.5;
                }
            } else if (locator.currentPath.path && locator.currentPath.access.readable) {
                leftButton.views[0].alpha = 1;
                rightButton.views[0].alpha = 1;
            } else {
                leftButton.views[0].alpha = 0.5;
                rightButton.views[0].alpha = 0.5;
            }
        } else {
            if (readable) {
                $('description').text = `W: ${writable}    E: ${executable}    D: ${deletable}`;
            } else {
                $('description').text = `File is not readable`;
            }
        }
    } else {
        $('description').text = 'Item not exist';
    }
}

function __getIconBySuffix(suffix = '') {
    let image;
    switch (suffix.toLowerCase()) {
        case 'bmp':
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'jp2':
        case 'gif':
        case 'icns':
        case 'ico':
        case 'raw':
        case 'heic':
        case 'tif':
        case 'tiff':
        case 'pic':
        case 'pict':
            image = $objc('UIImage').$imageNamed('explorer-image');
            break;
        case 'md':
            image = $objc('UIImage').$imageNamed('explorer-markdown');
            break;
        case 'txt':
        case 'strings':
        case 'json':
            image = $objc('UIImage').$imageNamed('explorer-text');
            break;
        case 'js':
        case 'htm':
        case 'html':
            image = $objc('UIImage').$imageNamed('explorer-code');
            break;
        case 'midi':
        case 'wav':
        case 'mp3':
        case 'caf':
        case 'm4r':
            image = $objc('UIImage').$imageNamed('explorer-audio');
            break;
        case 'avi':
        case 'mp4':
        case 'mov':
        case 'mpeg':
        case 'mpeg2':
            image = $objc('UIImage').$imageNamed('explorer-video');
            break;
        case 'db':
            image = $objc('UIImage').$imageNamed('explorer-database');
            break;
        case 'zip':
            image = $objc('UIImage').$imageNamed('explorer-zip');
            break;
        default:
            break;
    }
    return image ? image.rawValue() : $objc('UIImage').$imageNamed('explorer-file').rawValue();
}

function __showSuggestions(show) {
    $ui.animate({
        duration: 0.3,
        animation() {
            $('suggestions').alpha = show;
        }
    });
}

function __proxy(locator) {
    const { open, history, currentPath, sourcePath } = locator;
    return {
        open, history, currentPath,
        get current() { return locator.current },
        get further() { return locator.further },
        sourcePath: new Proxy(sourcePath, {
            set(target, key, value, receiver) {
                target[key] = value;
                if (key === 'path') {
                    if (value) {
                        leftButton.views[0].alpha = 0;
                        rightButton.views[0].alpha = 0;

                        leftButton.views[1].alpha = 0.5;
                        if (rightButton.views[1]) {
                            rightButton.views[1].alpha = 0.5;
                        } else {
                            rightButton.add({
                                type: 'label',
                                props: {
                                    text: 'Move',
                                    textColor: $color('white'),
                                    alpha: 0.5
                                },
                                layout: $layout.fill
                            });
                        }
                    }
                }
            },
            deleteProperty(target, key) {
                delete target[key];
                if (key === 'path') {
                    __showSuggestions(false);
                    __goto(currentPath);

                    leftButton.views[1].alpha = 0;
                    rightButton.views[1].remove();

                    if (currentPath.access.readable) {
                        leftButton.views[0].alpha = 1;
                        rightButton.views[0].alpha = 1;
                    } else {
                        leftButton.views[0].alpha = 0.5;
                        rightButton.views[0].alpha = 0.5;
                    }
                }
            }
        })
    };
}