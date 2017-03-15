#!/usr/local/bin/node

/*
# <bitbar.title>GitBar</bitbar.title>
# <bitbar.version>v1.4</bitbar.version>
# <bitbar.author>Dan Cadden</bitbar.author>
# <bitbar.author.github>shikkic</bitbar.author.github>
# <bitbar.desc>Quick check your Github stats</bitbar.desc>
# <bitbar.image>http://www.hosted-somewhere/pluginimage</bitbar.image>
# <bitbar.dependencies>node, gh-scrape</bitbar.dependencies>
# <bitbar.abouturl>https:/github.com/shikkic</bitbar.abouturl>
*/

// Import User Setting
require('dotenv').config({path: __dirname+'/../.env'});
const username = process.env.GITHUB_USERNAME;
const userUrl = "http://github.com/" + username;
const contributionGoalTracking = process.env.CONTRIBUTION_GOAL_TRACKING;
const contributionGoal = process.env.CONTRIBUTION_GOAL;
const compactUI = process.env.COMPACT_UI;

// Detect user's menu bar style
var child_process = require('child_process');
// Assume dark menu bar
var boldColor = "white";
try {
    child_process.execSync('defaults read -g AppleInterfaceStyle', { stdio: "ignore" });
} catch (e) {
    // AppleInterfaceStyle not set, thus user has light menu bar style
    boldColor = "black";
}

// Font, Color, and Emoji Settings
const redText = "| color=red size=14",
      normalText = "| size=14",
      boldText = "| color=" + boldColor + " size=14",
      heartEmoji = "♥︎",
      brokenHeartEmoji = "♡";

// Import Github Scraping Library
var gh = require('gh-scrape'),
         visibleEmoji;

const getGhContribStats = require('github-contrib-stats');

// Check to Make Sure User Set Default Configs
if (userUrl === "http://github.com/<YOUR_GITHUB_NAME_HERE>") {
    console.log(brokenHeartEmoji, "Please Set the Default Configs", brokenHeartEmoji);
    process.exit();
}

// Scrape Github Stats for <userUrl>
// gh.scrapeContributionDataAndStats(userUrl, function(data) {
getGhContribStats(username)
.then(function(data) {
    // Validate Request Data Exists
    if (data) {
        // Retrive Request Data
        const { totalContributions, todaysContributions, currentStreak, longestStreak }  = data.contributionStats;

        // Set Text Color Variables
        var contributionsTodayColor = todaysContributions ? normalText : redText,
            currentStreakColor = currentStreak ? normalText : redText,
            totalContributionsColor = totalContributions ? normalText : redText;

        // Set Displayed Emoji
        var visibleEmoji = totalContributions ? heartEmoji : brokenHeartEmoji;

        // Log Output To Bitbar
        if (compactUI == 'true') {
            console.log(visibleEmoji + " " + todaysContributions + contributionsTodayColor);
            console.log("---");
            console.log("Contributions");
            console.log("Today: ", todaysContributions, contributionsTodayColor);
        } else {
            console.log(visibleEmoji, " Contributions Today: ", todaysContributions, visibleEmoji, contributionsTodayColor);
            console.log("---");
        }
        console.log("Total: ", totalContributions, totalContributionsColor);
        if (contributionGoalTracking) {
            // Log Contribution Goal tracking if enabled
            console.log("---");
            console.log("Contribution Goal");
            console.log("Goal: ", contributionGoal, normalText);
            console.log("Completion: ", (totalContributions / contributionGoal * 100).toFixed(2) + "% " + boldText);
        }
        console.log("---");
        console.log("Streaks");
        console.log("Current: ", currentStreak, currentStreakColor);
        console.log("Longest: ", longestStreak, normalText);
        console.log("---");
        console.log('@' + username, "| size=20 href= " + userUrl, 'image=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');
    } else {
        console.log(brokenHeartEmoji + " error ", redText);
    }

});
