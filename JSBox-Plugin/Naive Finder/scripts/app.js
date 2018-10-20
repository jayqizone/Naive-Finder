const vm = require('./viewManager');
const { paste } = require('./actionManager');

const fm = $objc('NSFileManager').$defaultManager();

module.exports = {
  render() {
    $ui.render({
      props: {
        title: 'Naive Finder',
        navButtons: [
          {
            id: 'rightButton',
            title: 'Move',
            async handler() {
              await paste(vm.locator, 'move');
              vm.refresh();
            }
          }, {
            id: 'leftButton',
            title: 'Copy',
            async handler() {
              await paste(vm.locator, 'copy');
              vm.refresh();
            }
          }
        ]
      },
      views: [
        vm.createAddressBar(),
        vm.createItemList(),
        vm.createSuggestions(),
        vm.createDescriptionBar(),
        vm.createBackButton()
      ]
    });
  }
};
