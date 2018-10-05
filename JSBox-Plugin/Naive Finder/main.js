const [statusBarHeight, indicatorHeight] = $device.isIphoneX && $device.info.screen.width < $device.info.screen.height ? [44, 34] : [20, 0];

$defc('NSHomeDirectory', 'NSString *');

const fm = $objc('NSFileManager').$defaultManager();
const mb = $objc('NSBundle').$mainBundle();

const ROOT = '../../../../../../../../../../';

const BUNDLE_PATH = mb.$bundlePath().rawValue();
const APP_HOME = NSHomeDirectory().rawValue();
const APP_GROUP = fm.$containerURLForSecurityApplicationGroupIdentifier('group.jsbox.share').$path().rawValue();

const forwardImage = $objc('UIImage').$imageNamed('browser_forward').rawValue().resized($size(20, 20)).runtimeValue().$imageWithRenderingMode(2).rawValue();

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
                placeholder: 'Input Path',
                radius: 0
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
                    goto(sender.text);
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
                    goto(data.path, data.name, data.isDirectory);
                },
                didLongPress(sender, indexPath, data) {
                    $device.taptic(2);
                    share(data.path, data.name, data.isDirectory);
                }
            }
        },
        {
            type: 'list',
            props: {
                id: 'suggestions',
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
                                make.left.right.inset(0);
                            }
                        }, {
                            type: 'label',
                            props: {
                                id: 'subtitle',
                                font: $font(10)
                            },
                            layout: function (make) {
                                make.left.right.inset(0);
                                make.bottom.inset(5);
                            }
                        }
                    ]
                },
                data: [
                    { title: { text: '/' }, path: '/' },
                    { title: { text: '/Library/Ringtones' }, path: '/Library/Ringtones' },
                    { title: { text: '/System/Library' }, path: '/System/Library' },
                    { title: { text: 'Bundle Path' }, subtitle: { text: BUNDLE_PATH }, path: BUNDLE_PATH },
                    { title: { text: 'App Home' }, subtitle: { text: APP_HOME }, path: APP_HOME },
                    { title: { text: 'App Group' }, subtitle: { text: APP_GROUP }, path: APP_GROUP }
                ]
            },
            layout(make, view) {
                make.top.equalTo(view.prev);
                make.left.inset(15);
                make.right.inset(0);
                make.bottom.inset(40 + indicatorHeight);
            },
            events: {
                didSelect(sender, indexPath, data) {
                    sender.alpha = 0;
                    $('address').blur();
                    goto(data.path);
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
                        id: 'upButton',
                        image: $file.read('assets/up.png').image.runtimeValue().$imageWithRenderingMode(2).rawValue(),
                        bgcolor: $color('clear')
                    },
                    layout: $layout.fill,
                    events: {
                        tapped: function (sender) {
                            sender.animator.makeScale(0.8).makeOpacity(0.4).easeOut.thenAfter(0.05).makeScale(1.25).makeOpacity(1).easeIn.animate(0.05);

                            if ($('address').text === '/') {
                                showSuggestions(true);
                            } else {
                                showSuggestions(false);

                                let dirs = $('address').text.split('/');
                                dirs.pop() === '' && dirs.pop();
                                goto(dirs.join('/') + '/');
                            }
                        },
                        longPressed({ sender, location }) {
                            $device.taptic(2);
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
    ]
});

function goto(path, name, isDirectory) {
    let pStr = NSString.$stringWithString(path || '/');
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
            $('address').text = path + (path.endsWith('/') ? '' : '/');

            let fs = $file.list(ROOT + path) || [];

            let dirCount = 0;
            $('fileList').data = currentList = fs.map(el => {
                let filePath = pStr.$stringByAppendingPathComponent(el).rawValue();
                let isDirectory = $file.isDirectory(ROOT + filePath);
                let attrs = fm.$attributesOfItemAtPath_error(filePath, null);
                let name = el;
                let iconImage = null;
                let info = '';
                if (isDirectory) {
                    name += '/'
                    iconImage = $objc('UIImage').$imageNamed('explorer-folder').rawValue();

                    let ls = $file.list(ROOT + filePath);
                    if (ls !== undefined) {
                        info += ls.length;
                    }

                    dirCount++;
                } else {
                    iconImage = $objc('UIImage').$imageNamed('explorer-file').rawValue();

                    if (attrs) {
                        info = $objc('NSByteCountFormatter').$stringFromByteCount_countStyle(attrs.rawValue().NSFileSize, 0).rawValue().replace('字节', 'B');
                    }
                }

                return { name: el, isDirectory, path: filePath, file: { text: name }, icon: { image: iconImage }, info: { text: info }, forward: { image: isDirectory ? forwardImage : null } };
            }).sort((x, y) => {
                if (x.isDirectory ^ y.isDirectory) {
                    return x.isDirectory ? -1 : 1;
                } else {
                    return x.name.localeCompare(y.name);
                }
            });

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
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                        $quicklook.open({ image: fm.$contentsAtPath(path).rawValue().image });
                        break;
                    case 'md':
                    case 'txt':
                    case 'strings':
                    case 'js':
                        $quicklook.open({ text: fm.$contentsAtPath(path).rawValue().string });
                        break;
                    case 'json':
                        $quicklook.open({ json: fm.$contentsAtPath(path).rawValue().string });
                        break;
                    case 'htm':
                    case 'html':
                        $quicklook.open({ html: fm.$contentsAtPath(path).rawValue().string });
                        break;
                    case 'caf':
                    case 'm4r':
                        $audio.play({ url: 'file://' + path });
                        break;
                    default:
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
}

async function share(path, name, isDirectory) {
    if (isDirectory) {
        let dest = `${name}.zip`;
        let result = await $archiver.zip({
            directory: ROOT + path,
            dest
        });

        if (result) {
            $share.sheet([`${name}.zip`, $file.read(dest)]);
        }
    } else {
        $share.sheet([name, fm.$contentsAtPath(path).rawValue()]);
    }
}

function showSuggestions(show) {
    if (show) {
        $ui.animate({
            duration: 0.3,
            animation: function () {
                $('suggestions').alpha = 1;
            }
        });
    } else {
        $('suggestions').alpha = 0;
    }
}
