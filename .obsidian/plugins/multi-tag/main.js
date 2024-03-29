/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MultiTagPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/TagModal.ts
var import_obsidian = require("obsidian");
var TagModal = class extends import_obsidian.Modal {
  constructor(app, base, option = "inline", submission) {
    super(app);
    this.default = "";
    this.option = "inline";
    if (base instanceof import_obsidian.TFolder) {
      this.default = `${base.name.replace(" ", "-")}`;
    }
    this.base = base;
    this.submission = submission;
    this.option = option;
  }
  onSubmit(e, input, option) {
    e.preventDefault();
    const trimmed = input.replace(/ /g, "");
    this.submission(this.base, trimmed, option);
    this.close();
  }
  onOpen() {
    this.modalEl.addClass("modal");
    const { contentEl, titleEl } = this;
    titleEl.createEl("h2", { text: "Please type in a tag." });
    contentEl.createEl("span", {
      text: "If you add multiple tags, separate them with commas. Do not add '#'."
    });
    contentEl.createEl("form", { cls: "modal-form" }, (formEl) => {
      let selectEl = formEl.createEl("select", { cls: "select" });
      selectEl.createEl("option", {
        value: "inline",
        text: "Inline",
        attr: { selected: this.option === "inline" ? "selected" : null }
      });
      selectEl.createEl("option", {
        value: "yaml",
        text: "YAML",
        attr: { selected: this.option === "yaml" ? "selected" : null }
      });
      let inputEl = formEl.createEl("input", {
        value: this.default,
        attr: { id: "tagInput" }
      });
      formEl.createDiv("modal-button-container", (buttonEl) => {
        let btnSubmit = buttonEl.createEl("button", {
          text: "Submit",
          type: "submit",
          cls: "mod-cta"
        });
        let btnCancel = buttonEl.createEl("button", {
          text: "Cancel",
          type: "cancel"
        });
        btnCancel.addEventListener("click", () => this.close());
      });
      formEl.addEventListener(
        "submit",
        (e) => this.onSubmit(e, inputEl.value, selectEl.value)
      );
      setTimeout(() => inputEl.focus(), 0);
    });
  }
};

// src/TagSettingTab.ts
var import_obsidian2 = require("obsidian");
var TagSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    let { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("YAML or Inline").setDesc("Choose whether to use YAML or inline tags.").addDropdown((dropdown) => {
      dropdown.addOption("inline", "Inline");
      dropdown.addOption("yaml", "YAML");
      dropdown.setValue(this.plugin.settings.yamlOrInline);
      dropdown.onChange(async (value) => {
        this.plugin.settings.yamlOrInline = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/main.ts
var defaultSettings = {
  yamlOrInline: "inline"
};
var MultiTagPlugin = class extends import_obsidian3.Plugin {
  //Set as Events to unload when needed.
  async onload() {
    await this.loadSettings();
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file, source) => {
        if (file instanceof import_obsidian3.TFolder) {
          menu.addItem((item) => {
            item.setIcon("tag").setTitle("Tag folder's files").onClick(
              () => new TagModal(
                this.app,
                file,
                this.settings.yamlOrInline,
                async (obj, string, setting) => {
                  this.settings.yamlOrInline = setting;
                  await this.saveSettings();
                  this.searchThroughFolders(obj, string);
                }
              ).open()
            );
          });
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("files-menu", (menu, file, source) => {
        menu.addItem((item) => {
          item.setIcon("tag").setTitle("Tag selected files").onClick(
            () => new TagModal(
              this.app,
              file,
              this.settings.yamlOrInline,
              async (obj, string, setting) => {
                this.settings.yamlOrInline = setting;
                await this.saveSettings();
                this.searchThroughFiles(obj, string);
              }
            ).open()
          );
        });
      })
    );
    this.addSettingTab(new TagSettingTab(this.app, this));
  }
  /** Get all files belonging to a folder. */
  searchThroughFolders(obj, string) {
    for (let child of obj.children) {
      if (child instanceof import_obsidian3.TFolder) {
        this.searchThroughFolders(child, string);
      }
      if (child instanceof import_obsidian3.TFile && child.extension === "md") {
        if (this.settings.yamlOrInline === "inline") {
          this.appendToFile(child, string);
        } else {
          this.addToFrontMatter(child, string);
        }
      }
    }
  }
  /** Iterate through a selection of files. */
  searchThroughFiles(arr, string) {
    for (let el of arr) {
      if (el instanceof import_obsidian3.TFile && el.extension === "md") {
        if (this.settings.yamlOrInline === "inline") {
          this.appendToFile(el, string);
        } else {
          this.addToFrontMatter(el, string);
        }
      }
    }
  }
  /** Add a tag to the bottom of a note. */
  appendToFile(file, string) {
    const tags = string.split(",");
    for (let tag of tags) {
      this.app.vault.append(file, `
#${tag}`);
    }
  }
  /** Add tags to the top of a note. */
  addToFrontMatter(file, string) {
    const tags = string.split(",");
    this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!fm.tags) {
        fm.tags = new Set(tags);
      } else {
        fm.tags = /* @__PURE__ */ new Set([...fm.tags, ...tags]);
      }
    });
  }
  async loadSettings() {
    this.settings = Object.assign({}, defaultSettings, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
