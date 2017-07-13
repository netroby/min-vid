DIST := dist
FILEBASE := min-vid
VERSION := `cat install.rdf | tr '\n' ' ' | sed "s/.*<em:version>\(.*\)<\/em:version>.*/\1/"`
PWD := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
FILENAME := $(FILEBASE)-$(VERSION).xpi
XPI := $(PWD)/$(DIST)/$(FILENAME)`""`

all:
	@$(MAKE) build

build:
	@mkdir -p $(DIST)
	@rm -f $(XPI)
	@zip -r $(XPI) . -x "$(DIST)/*" ".*" "Makefile" > /dev/null
	@echo "Built: $(XPI)"
