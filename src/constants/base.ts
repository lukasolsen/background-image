import { window } from "vscode";
import { ConfigLoader } from "../base/configLoader";

export const LogChannel = window.createOutputChannel("Background Image");

export const configLoader = new ConfigLoader("background-image");
