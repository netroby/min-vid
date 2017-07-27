DIST := dist
FILEBASE := min-vid
VERSION := `cat install.rdf | tr '\n' ' ' | sed "s/.*<em:version>\(.*\)<\/em:version>.*/\1/"`
PWD := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
FILENAME := "$(FILEBASE)-$(VERSION).xpi"
XPI := $(PWD)/$(DIST)/$(FILENAME)`""`
ADDON_DIR := addon

all:
	@$(MAKE) build

build:
	@mkdir -p $(DIST)
	@rm -f $(XPI)
	@zip -r $(XPI) . -x locales/\* -x webextension/lib/\* -x webextension/background.js -x LICENSE -x Makefile -x stories/\* -x dist/\* -x webpack.config.js -x docs/\* -x node_modules/\* -x bin/\* -x .git/\* -x .\* -x \*.md -x index.html > /dev/null
	@echo "Built: $(XPI)"



# @mkdir -p $(ADDON_DIR)
# @cp -r "webextension/" $(ADDON_DIR)
# @cp -r "chrome/" $(ADDON_DIR)
# @cp -r "lib/" $(ADDON_DIR)
# @cp  "bootstrap.js" $(ADDON_DIR)
# @cp  "chrome.manifest" $(ADDON_DIR)
# @cp  "install.rdf" $(ADDON_DIR)
# @cd "$(PWD)/addon/"
