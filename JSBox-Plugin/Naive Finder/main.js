// require('socketLogger').init();

const [statusBarHeight, indicatorHeight] = $device.isIphoneX && $device.info.screen.width < $device.info.screen.height ? [44, 34] : [20, 0];

const fm = $objc('NSFileManager').$defaultManager();
const mb = $objc('NSBundle').$mainBundle();

const ROOT = '../../../../../../../../../../';

const BUNDLE_PATH = mb.$bundlePath().rawValue();
const APP_HOME = NSHomeDirectory().rawValue();
const APP_GROUP = fm.$containerURLForSecurityApplicationGroupIdentifier('group.jsbox.share').$path().rawValue();
const ICLOUD = '/private/var/mobile/Library/Mobile Documents/iCloud~app~cyan~jsbox/';

const FORWARD_ICON = $objc('UIImage').$imageNamed('browser_forward').rawValue().resized($size(20, 20)).runtimeValue().$imageWithRenderingMode(2).rawValue();

let current = -1, further = -1;
let history = [];
let currentList = [];

$ui.render({
    props: {
        title: 'Naive Finder'
    },
    views: [
        {
            type: 'input',
            props: {
                id: 'address',
                type: $kbType.search,
                placeholder: 'Input Path',
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
                    showSuggestions(true);
                },
                didEndEditing(sender) {
                },
                changed(sender) {
                    if (sender.text === '') {
                        showSuggestions(true);
                    } else {
                        showSuggestions(false);
                        $('fileList').data = currentList.filter(el => el.path.startsWith(sender.text));
                    }
                },
                returned(sender) {
                    showSuggestions(false);
                    sender.blur();
                    goto({ path: sender.text });
                }
            }
        },
        {
            type: 'list',
            props: {
                id: 'fileList',
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
                                id: 'file'
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
                    goto(data);
                },
                didLongPress(sender, indexPath, data) {
                    $device.taptic(0);
                    share(data);
                },
                didScroll({ tracking, contentOffset: { y } }) {
                },
                didEndDragging({ contentOffset: { y } }) {
                    if (y < -50) {
                        $('address').focus();
                    }
                }
            }
        },
        {
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
                    showSuggestions(false);
                    $('address').blur();
                    goto(data);
                },
                didScroll({ tracking, contentOffset: { y } }) {
                },
                didEndDragging({ contentOffset: { y } }) {
                    if (y < -50) {
                        $('address').focus();
                    } else if (y > 40) {
                        showSuggestions(false);
                    }
                }
            }
        },
        {
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
        },
        {
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

                            if (goto({ direction: -1 }) < 0) {
                                showSuggestions(true);
                            }
                        },
                        longPressed({ sender, location }) {
                            $device.taptic(0);
                            showSuggestions(true);
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
    ],
    events: {
        appeared() {
        },
    }
});

function goto({ path, name, isDirectory, direction }) {
    if (direction < 0) {
        if (current < 1) {
            return -1;
        }
        path = history[--current].path;
    } else if (direction > 0) {
        if (current === further) {
            return Number.MAX_SAFE_INTEGER;
        }
        path = history[++current].path;
    }
    pStr = NSString.$stringWithString(path || '/').$stringByAppendingPathComponent('');
    path = pStr.rawValue();

    if (fm.$fileExistsAtPath(path)) {
        let readable = fm.$isReadableFileAtPath(path);
        let writable = fm.$isWritableFileAtPath(path);
        let executable = fm.$isExecutableFileAtPath(path);
        let deletable = fm.$isDeletableFileAtPath(path);

        if (isDirectory === undefined) {
            isDirectory = $file.isDirectory(ROOT + path);
        }

        if (isDirectory) {
            if (!direction) {
                history[further = ++current] = { path };
            }
            if (history[current - 1]) {
                history[current - 1].contentOffset = $('fileList').contentOffset;
            }

            let title = path.split('/').pop();
            title = title === '' ? 'Naive Finder' : title;
            $ui.title = title;
            $('address').text = path + (path.endsWith('/') ? '' : '/');

            let fs = $file.list(ROOT + path) || [];

            let dirCount = 0;
            $('fileList').data = currentList = fs.map(el => {
                let itemPath = pStr.$stringByAppendingPathComponent(el).rawValue();
                let isDirectory = $file.isDirectory(ROOT + itemPath);
                let attrs = fm.$attributesOfItemAtPath_error(itemPath, null);
                let iconImage = null;
                let info = '';
                let forwardImage = null;
                if (isDirectory) {
                    iconImage = $objc('UIImage').$imageNamed('explorer-folder').rawValue();

                    let ls = $file.list(ROOT + itemPath);
                    if (ls !== undefined) {
                        info += ls.length;
                        forwardImage = FORWARD_ICON;
                    }

                    dirCount++;
                } else {
                    iconImage = getIconBySuffix(el.split('.').pop());

                    if (attrs) {
                        info = $objc('NSByteCountFormatter').$stringFromByteCount_countStyle(attrs.rawValue().NSFileSize, 0).rawValue().replace('字节', 'B');
                    }
                }

                return {
                    path: itemPath,
                    name: el,
                    isDirectory,
                    parent: path,
                    access: { writable, executable, deletable },
                    file: { text: el },
                    icon: { image: iconImage },
                    info: { text: info },
                    forward: { image: forwardImage }
                };
            }).sort((x, y) => {
                if (x.isDirectory ^ y.isDirectory) {
                    return x.isDirectory ? -1 : 1;
                } else {
                    return x.name.localeCompare(y.name);
                }
            });

            $('fileList').contentOffset = direction ? history[current].contentOffset : $point(0, 0);

            if (readable) {
                $('description').text = `Directory: ${dirCount}    File:${currentList.length - dirCount}    W: ${writable}    E: ${executable}    D: ${deletable}`;
            } else {
                $('description').text = `Direcotory is not readable`;
            }
        } else {
            if (readable) {
                if (name === undefined) {
                    name = path.split('/').pop();
                }
                let suffix = name.split('.').pop().toLowerCase();
                switch (suffix) {
                    case 'strings':
                        $quicklook.open({ text: fm.$contentsAtPath(path).rawValue().string });
                        break;
                    case 'json':
                        $quicklook.open({ json: fm.$contentsAtPath(path).rawValue().string });
                        break;
                    case 'caf':
                        // case 'm4r':
                        $audio.play({ url: 'file://' + path });
                        break;
                    default:
                        $quicklook.open({
                            type: suffix,
                            data: fm.$contentsAtPath(path).rawValue()
                        });
                        break;
                }
                $('description').text = `W: ${writable}    E: ${executable}    D: ${deletable}`;
            } else {
                $('description').text = `File is not readable`;
            }
        }
    } else {
        $('description').text = 'Item not exist';
    }

    return current;
}

function getIconBySuffix(suffix) {
    let image;
    switch (suffix) {
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

async function share({ path, name, isDirectory, parent, access: { writable, executable, deletable } }) {
    let items;
    if (isDirectory) {
        items = ['Archive'];
    } else {
        items = ['Share'];
    }
    deletable && items.push('Rename');
    deletable && items.push('Delete');

    let { title, index } = await $ui.menu(items);
    switch (title) {
        case 'Archive':
            let dest = `${name}.zip`;
            if (await $archiver.zip({ directory: ROOT + path, dest })) {
                await $share.sheet([`${name}.zip`, $file.read(dest)]);
                $file.delete(dest);
            }
            break;
        case 'Share':
            $share.sheet([name, fm.$contentsAtPath(path).rawValue()]);
            break;
        case 'Rename':
            renameItem(path, name, parent);
            break;
        case 'Delete':
            deleteItem(path, parent);
            break;
        default:
            break;
    }
}

async function renameItem(path, name, parent) {
    let newName = await $input.text({ text: name, placeholder: 'Input new name' });
    if (newName !== undefined && newName !== '') {
        let newPath = NSString.$stringWithString(parent).$stringByAppendingPathComponent(newName).rawValue();
        fm.$moveItemAtPath_toPath_error(path, newPath, null);

        goto({ path: parent });
    }
}

async function deleteItem(path, parent) {
    let { index } = await $ui.alert({
        title: 'Are you sure you want to permanently erase this item?',
        message: 'You can\'t undo this action.',
        actions: [{ title: 'OK' }, { title: 'CANCEL' }]
    });
    if (index === 0) {
        fm.$removeItemAtPath_error(path, null);

        goto({ path: parent });
    }
}

function showSuggestions(show) {
    $ui.animate({
        duration: 0.3,
        animation() {
            $('suggestions').alpha = show;
        }
    });
}
