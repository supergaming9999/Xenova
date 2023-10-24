const { Snowflake, User } = require("discord.js");
const profileModel = require('../models/profileSchema');
const { Document } = require("mongoose");
const Util = require("./Util");

module.exports = class DB {
    /**
     * Get the Discord User's database profile
     * @param {User} user Discord User
     * @returns {Promise<Document & Util.dbModel>}
     */
    static async getProfile(user) {
        let profileData;
        var defaultValues = {
            userID: user.id,
            username: user.username,
            bank: 0,
            monkey: 500,
            dailyStreak: 0
        };
        try {
            profileData = await profileModel.findOne({ userID: user.id });
            if (!profileData) {
                profileData = await profileModel.create(defaultValues);
                await profileData.save();
            } else {
                var update = false;
                for (var val of Object.keys(defaultValues)) {
                    if (!(val in profileData)) {
                        profileData[val] = defaultValues[val];
                        if (!update) update = true;
                    }
                }
                if (profileData.username != user.username) {
                    profileData.username = user.username;
                    if (!update) update = true;
                }
                if (update) {
                    await profileData.save();
                }
            }
        } catch (err) {
            console.error(err);
        }
        return profileData;
    }

    /**
     * Get a mapping of all database profiles
     * @returns {Map<Snowflake, Document<unknown, {}, { userID: string; monkey: number; dailyStreak: number; dailyTime?: Date | undefined; }>>}
     */
    static async getAll() {
        var userMap = new Map();
        try {
            var users = await profileModel.find({}, null, { sort: { monkey: -1 }, limit: 10 });
            users.forEach(user => {
                userMap.set(user.userID, user);
            });
        } catch (err) {
            console.error(err);
        }
        return userMap;
    }

    /**
     * Check the user's interest date and add monkey if due
     * @param {User} user Discord User
     * @returns {Promise<Document & Util.dbModel>}
     */
    static async checkInterest(user) {
        var profile = await this.getProfile(user);
        if (profile.bank < 1) return profile;
        var comp = (Date.now() - profile.interestTime) / 1000 / 60 / 60;
        var dif = Math.floor(comp / 24) + 1;
        if (comp > 0) {
            profile.bank += Math.round(profile.bank * 0.05) * dif;
            profile.interestTime = Date.now() + (1000 * 60 * 60 * 24);
            profile.save();
        }
        return profile;
    }

    /**
     * Apply the daily rewards to a profile
     * @param {Util.dbModel} profile The database user profile
     * @returns {{ daily: number, nextTime: number }} The calculated daily reward and the time until the next one
     */
    static async applyRewards(profile) {
        var nextTime = Date.now() + (1000 * 60 * 60 * 12);
        profile.dailyTime = nextTime;
        profile.dailyStreak += 1;
        var daily = Math.round((500 + Math.random() * (200)) + (profile.dailyStreak * 150));
        profile.monkey += daily;
        await profile.save();
        return { daily, nextTime };
    }
    
    /**
     * Add monkey to a user's monkey
     * @param {User} user Discord User
     * @param {number} amount Monkey amount to add
     */
    static async addMonkey(user, amount) {
        var currAmount = (await this.getProfile(user)).monkey;
        if ((currAmount + amount) < 0) amount = currAmount;
        await profileModel.findOneAndUpdate({
            userID: user.id
        }, {
            $inc: {
                "monkey": amount
            }
        }).exec();
    }

    /**
     * Add monkey to a user's bank
     * @param {User} user Discord User
     * @param {number} amount Monkey amount to add
     */
    static async addBank(user, amount) {
        var currAmount = (await this.getProfile(user)).bank;
        if ((currAmount + amount) < 0) amount = currAmount;
        await profileModel.findOneAndUpdate({
            userID: user.id
        }, {
            $inc: {
                "bank": amount
            }
        }).exec();
    }
}