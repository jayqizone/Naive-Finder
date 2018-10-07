const fm = $objc('NSFileManager').$defaultManager();

const ROOT = '../../../../../../../../../../';

module.exports = {
    makeLocator,
    share
}

function makeLocator(listId = '') {
    let current = -1, further = -1;
    let history = [];

    function open({ path, name, isDirectory, direction }) {
        let before = current;
        if (direction < 0) {
            if (current === 0) {
                current--;
                return { clear: true };
            } else if (current < 0) {
                return;
            }
            path = history[--current].path;
        } else if (direction > 0) {
            if (current === further) {
                return;
            }
            path = history[++current].path;
        }
        pStr = NSString.$stringWithString(path || '/').$stringByAppendingPathComponent('');
        path = pStr.rawValue();

        let exists = fm.$fileExistsAtPath(path);
        let readable, writable, executable, deletable;
        let list = [];
        let dirCount = 0, fileCount = 0;
        if (exists) {
            readable = fm.$isReadableFileAtPath(path);
            writable = fm.$isWritableFileAtPath(path);
            executable = fm.$isExecutableFileAtPath(path);
            deletable = fm.$isDeletableFileAtPath(path);

            if (name === undefined) {
                name = pStr.$lastPathComponent().rawValue();
            }

            if (isDirectory === undefined) {
                isDirectory = $file.isDirectory(ROOT + path);
            }

            if (isDirectory) {
                let refresh = path === (history[current] || {}).path;
                if (refresh) {
                    if (listId !== '') {
                        history[before].contentOffset = $(listId).contentOffset;
                    }
                } else {
                    if (direction === undefined) {
                        history[further = ++current] = { path };
                    }
                    if (listId !== '' && history[current - 1]) {
                        history[before].contentOffset = $(listId).contentOffset;
                    }
                }

                let fs = $file.list(ROOT + path) || [];

                list = fs.map(el => {
                    let itemPath = pStr.$stringByAppendingPathComponent(el).rawValue();
                    let isDirectory = $file.isDirectory(ROOT + itemPath);
                    let attrs = fm.$attributesOfItemAtPath_error(itemPath, null);
                    attrs = attrs ? attrs.rawValue() : undefined;
                    let readable = fm.$isReadableFileAtPath(itemPath);
                    let writable = fm.$isWritableFileAtPath(itemPath);
                    let executable = fm.$isExecutableFileAtPath(itemPath);
                    let deletable = fm.$isDeletableFileAtPath(itemPath);
                    let itemCount;
                    if (isDirectory) {
                        let ls = $file.list(ROOT + itemPath);
                        if (ls !== undefined) {
                            itemCount = ls.length;
                        }
                        dirCount++;
                    } else {
                        fileCount++;
                    }

                    return {
                        path: itemPath,
                        name: el,
                        isDirectory,
                        parent: path,
                        access: { readable, writable, executable, deletable },
                        attrs,
                        itemCount
                    };
                }).sort((x, y) => {
                    if (x.isDirectory ^ y.isDirectory) {
                        return x.isDirectory ? -1 : 1;
                    } else {
                        return x.name.localeCompare(y.name);
                    }
                });
            } else if (readable) {
                __quicklook(path, name);
            }
        }

        return {
            path, name, exists, isDirectory,
            contentsOfDirectory: { list, dirCount, fileCount },
            access: { readable, writable, executable, deletable }
        }
    }

    return {
        open, history,
        get current() { return current },
        get further() { return further }
    }
}

function __quicklook(path, name) {
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
}

async function share({ path, name, isDirectory, parent, access: { readable, writable, executable, deletable } }) {
    let items;
    if (isDirectory) {
        items = ['Archive'];
    } else {
        items = ['Share'];
    }
    deletable && items.push('Rename');
    deletable && items.push('Delete');

    let { title, index } = await $ui.menu(items);
    let refresh;
    switch (title) {
        case 'Archive':
            let dest = `${name}.zip`;
            if (await $archiver.zip({ directory: ROOT + path, dest })) {
                await $share.sheet([`${name}.zip`, $file.read(dest)]);
                $file.delete(dest);
            }
            break;
        case 'Share':
            await $share.sheet([name, fm.$contentsAtPath(path).rawValue()]);
            refresh = true;
            break;
        case 'Rename':
            await __renameItem(path, name, parent);
            refresh = true;
            break;
        case 'Delete':
            await __deleteItem(path, parent);
            refresh = true;
            break;
        default:
            break;
    }

    return { refresh }
}

async function __renameItem(path, name, parent) {
    let newName = await $input.text({ text: name, placeholder: 'Input new name' });
    if (newName !== undefined && newName !== '') {
        let newPath = NSString.$stringWithString(parent).$stringByAppendingPathComponent(newName).rawValue();
        fm.$moveItemAtPath_toPath_error(path, newPath, null);
    }
}

async function __deleteItem(path, parent) {
    let { index } = await $ui.alert({
        title: 'Are you sure you want to permanently erase this item?',
        message: 'You can\'t undo this action.',
        actions: [{ title: 'OK' }, { title: 'CANCEL' }]
    });
    if (index === 0) {
        fm.$removeItemAtPath_error(path, null);
    }
}
