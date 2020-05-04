const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
const license = require("./licenses.js");
let logMe = false;

const LICENSES = {
  None: { textFunc: license.none, badge: "" },
  "Apache License 2.0": {
    textFunc: license.apacheLicense2_0,
    badge: "https://img.shields.io/badge/License-Apache%202.0-blue.svg",
  },
  "GNU General Public License v3.0": {
    textFunc: license.gnu_GeneralPublicLicenseV3_0,
    badge: "https://img.shields.io/badge/License-GPLv3-blue.svg",
  },
  "MIT License": { textFunc: license.mitLicense, badge: "https://img.shields.io/badge/License-MIT-yellow.svg" },
  'BSD 2-Clause "Simplified" License': {
    textFunc: license.bsd2_ClauseSimplifiedLicense,
    badge: "https://img.shields.io/badge/License-BSD%202--Clause-orange.svg",
  },
  'BSD 3-Clause "New" or "Revised" License': {
    textFunc: license.bsd3_ClauseSimplifiedLicense,
    badge: "https://img.shields.io/badge/License-BSD%203--Clause-blue.svg",
  },
  "Creative Commons Zero v1.0 Universal": {
    textFunc: license.creativeCommonsZeroV1_0Universal,
    badge: "https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg",
  },
  "Eclipse Public License 2.0": {
    textFunc: license.eclipsePublicLicense2_0,
    badge: "https://img.shields.io/badge/License-EPL%201.0-red.svg",
  },
  "GNU Affero General Public License v3.0": {
    textFunc: license.gnuAfferoGeneralPublicLicenseV3_0,
    badge: "https://img.shields.io/badge/License-AGPL%20v3-blue.svg",
  },
  "GNU General Public License v2.0": {
    textFunc: license.gnuGeneralPublicLicenseV2_0,
    badge: "https://img.shields.io/badge/License-GPL%20v2-blue.svg",
  },
  "GNU Lesser General Public License v2.1": {
    textFunc: license.gnuLesserGeneralPublicLicenseV3_0,
    badge: "https://img.shields.io/badge/License-LGPL%20v3-blue.svg",
  },
  "GNU Lesser General Public License v3.0": {
    textFunc: license.gnuLesserGeneralPublicLicenseV3_0,
    badge: "https://img.shields.io/badge/License-LGPL%20v3-blue.svg",
  },
  "Mozilla Public License 2.0": {
    textFunc: license.mozillaPublicLicense2_0,
    badge: "https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg",
  },
  "The Unlicense": {
    textFunc: license.theUnlicense,
    badge: "https://img.shields.io/badge/license-Unlicense-blue.svg ",
  },
};

const MIN_DESCRIPTION_LENGTH = 20;
const EMAIL_REGEX1 = "/^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/";
let gitHubUserName = null;
let email = null;
let fullName = null;
let projectName = null;
let projectUrl = null;
let projectDescription = null;
let questions = [
  {
    type: "input",
    message: "What is your Github username?",
    name: "gitHubUsername",
    validate: async function checkGitHub(name) {
      try {
        const { data } = await axios.get(`https://api.github.com/users/${name}`);
        if (data != null) {
          if (logMe) console.log(data);
          fullName = data.name;
          email = data.email;
          gitHubUserName = data.login;
          return true;
        } else return `\n\nUnable to find GiitHub user "${name}"`;
      } catch (err) {
        if (logMe) console.log(`\n\nUnable to find GitHub user "${name}"`);
        return `\n\nUnable to find GitHub user "${name}"`;
      }
    },
  },
  {
    type: "input",
    name: "email",
    message: "What is your email address?",
    default: function getProjectEmail() {
      return email;
    },
    validate: validateEmail,
  },
  {
    type: "input",
    name: "projectName",
    message: "What is the name of your project?",
    validate: async function validateProjectName(name) {
      let errorText = null;
      console.clear();
      if (name == null || name.trim().length == 0) {
        errorText = "Invalid project name";
        if (logMe) console.log(errorText);
      } else {
        let projName = name.trim();
        name = name.trim().toLowerCase();
        try {
          // use this to list all public repos
          // let repoUrl = `https://api.github.com/users/${gitHubUserName}/repos?per_page=100`;
          let repoUrl = `https://api.github.com/repos/${gitHubUserName}/${name}`;
          const { data } = await axios.get(repoUrl);
          if (data != null) {
            console.clear();
            if (logMe) console.log(data);
            // go through data array and look for the project name
            // for (let index = 0; index < data.length; index++) {
            //   if (data[index].name.toLowerCase() == name) {
            //     projectName = data[index].name;
            //     projectUrl = data[index].html_url;
            //     projectDescription = data[index].description;
            //     break;
            //   }
            // }
            // if (projectName == null) errorText = `Unable to find PUBLIC repo "${projName}"`;
            projectName = data.name;
            projectUrl = data.html_url;
            projectDescription = data.description;
          } else errorText = `Project name ${projName} is not a valid PUBLIC repo for this user`;
        } catch (err) {
          errorText = `\n\nUnable to find GitHub user "${name}"`;
          if (logMe) console.log(errorText);
        }
      }
      return errorText || true;
    },
  },
  {
    type: "input",
    name: "description",
    message: `Enter a brief description of your project (${MIN_DESCRIPTION_LENGTH} chars min)`,
    default: function getProjectDescription() {
      return projectDescription;
    },
    validate: validateDescription,
  },
  {
    type: "input",
    name: "projectUrl",
    message: "Enter your project URL",
    default: function getProjectUrl() {
      return projectUrl;
    },
  },
  {
    type: "list",
    name: "license",
    message: "Select your projects License type",
    choices: Object.keys(LICENSES),
    default: function getDefaultLicense() {
      return Object.keys(LICENSES)[0];
    },
  },
  {
    type: "input",
    name: "installCmd",
    message: "What command(s) should be run to install dependencies?",
    default: "npm install",
  },
  {
    type: "input",
    name: "testCmd",
    message: "Enter test command",
    default: "npm test",
  },
  {
    type: "input",
    name: "howToUse",
    message: "Indicate how this repo can be used",
  },
  {
    type: "input",
    name: "contribute",
    message: "How would a user contribute to this repo?",
  },
  // {
  //   type: "",
  //   name: "",
  //   message: "",
  // },
  // {
  //   type: "",
  //   name: "",
  //   message: "",
  // },
];
console.clear();
inquirer.prompt(questions).then((data) => {
  if (logMe) console.log(data);
  writeReadmeFile(data);
});

function validateEmail(email) {
  if (logMe) console.log(email);
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  if (logMe) console.log(`You have entered an invalid email address!(${email})`);
  return `You have entered an invalid email address!(${email})`;
}

function validateDescription(description) {
  if (description == null || description.trim().length < MIN_DESCRIPTION_LENGTH)
    return "Project description must be 50 characters or more";
  else {
    return true;
  }
}

function writeReadmeFile(data) {
  if (logMe) console.log(`Data  GitHubUser: ${data.gitHubUsername}`);
  if (logMe) console.log(`Global GitHubUser: ${gitHubUserName}`);
  let readMeText = `# ${data.projectName}\n`;
  if (data.license != "None") {
    let badgeUrl = LICENSES[data.license].badge;
    readMeText += `[![GitHub license](${badgeUrl})](${data.projectUrl})\n`;
  }
  readMeText += `\n## Description\n${data.description}\n\n`;
  readMeText += getTOC(data);
  readMeText += getInstallSection(data);
  readMeText += getHowToSection(data);
  readMeText += getLicenseText(data);
  readMeText += getContribute(data);
  readMeText += getHowToTest(data);
  readMeText += getContactSection(data);
  fs.writeFileSync("README-gen.md", readMeText);
  console.clear();
  console.log(`\n\nYourREADME file "README-gen.md" has been successfully generated!!\n\n`);
}

function getTOC(data) {
  let retval = `## Table of Contents\n\n`;
  retval += ``;
  retval += `* [Installation](#installCmd)\n\n`;
  retval += `* [How To Use](#howToUse)\n\n`;
  retval += `* [License](#license)\n\n`;
  retval += `* [Contribution](#contribute)\n\n`;
  retval += `* [How To Test](#testCmd)\n\n`;
  retval += `* [Contact](#contact)\n\n`;
  return retval;
}

function getInstallSection(data) {
  let cmd = data.installCmd;
  if (cmd == "") cmd = "?????";
  return `## Installation\n\nTo install all the necessary components, run the following command:\n\n***${data.installCmd}***\n\n`;
}

function getHowToSection(data) {
  let howToUse = data.howToUse;
  if (howToUse == "") howToUse = "?????";
  return `## How To Use\n\nTo use the repo, do the folllowing:\n\n***${howToUse}***\n\n`;
}

function getLicenseText(data) {
  let retval = `## License\n\n`;
  if (data.license == "None") retval += `No license type specified or indicated\n\n`;
  else retval += LICENSES[data.license].textFunc(fullName) + "\n\n";

  return retval;
}

function getContribute(data) {
  let retval = `## Contribution\n\n`;
  if (data.contribute != "") retval += `${data.contribute}\n\n`;
  else retval += "??????";
  return retval;
}

function getHowToTest(data) {
  let retval = `## How To Test\n\n`;
  if (data.testCmd == "") retval += "***??????***\n\n";
  else retval += `***${data.testCmd}****\n\n`;
  return retval;
}

function getContactSection(data) {
  let retval = `##Contact\n\nFor further information about this repo, please contact using the following email:\n\n`;
  retval += `***${data.email}***\n\n`;
  return retval;
}
