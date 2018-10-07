const vm = require('./viewManager');

module.exports = {
  render() {
    $ui.render({
      props: {
        title: 'Naive Finder'
      },
      views: [vm.createAddressBar(), vm.createItemList(), vm.createSuggestions(), vm.createDescriptionBar(), vm.createBackButton()]
    });
  }
}