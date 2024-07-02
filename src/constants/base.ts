import { window } from "vscode";
import { ConfigLoader } from "../base/config-loader";

export const LogChannel = window.createOutputChannel("Background Image");

export const configLoader = new ConfigLoader();
