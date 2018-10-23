const vm = require('./viewManager');
const { addTo, paste } = require('./actionManager');

let initiated = false;
let leftButton, rightButton;

module.exports = {
  render() {
    $ui.render({
      props: {
        title: 'Naive Finder',
        navButtons: [
          {
            // title: 'Move',
            image: $objc('UIImage').$imageNamed('bar-item-add').rawValue(),
            async handler() {
              if (rightButton.views[0].alpha === 1) {
                vm.showSuggestions(false);

                await addTo(vm.locator, vm.refresh);
              } else if (rightButton.views[1].alpha === 1) {
                await paste(vm.locator, 'move');
              }
            }
          }, {
            // title: 'Copy',
            image: $objc('UIImage').$imageNamed('bar-item-search').rawValue(),
            async handler() {
              const leftButton = $ui.window.super.super.super.super.views[1].views[2].views[1].views[0];
              if (leftButton.views[0].alpha === 1) {
                vm.showSuggestions(false);
              } else if (leftButton.views[1].alpha === 1) {
                await paste(vm.locator, 'copy');
              }
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
      ],
      events: {
        appeared() {
          if (!initiated) {
            initiated = true;
            $delay(0, function () {
              leftButton = $ui.window.super.super.super.super.views[1].views[2].views[1].views[0];
              rightButton = $ui.window.super.super.super.super.views[1].views[2].views[1].views[2];
              leftButton.add({
                type: 'label',
                props: {
                  text: 'Copy',
                  textColor: $color('white'),
                  alpha: 0
                },
                layout: $layout.fill
              });
              leftButton.views[0].alpha = 0.5;
              rightButton.views[0].alpha = 0.5;
            });
          }
        },
        disappeared() {
        },
        dealloc() {
        }
      }
    });
  }
};
