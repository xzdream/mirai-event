using System;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    [Flags]
    public enum Class
    {
        Warrior = 1,
        Paladin = 2,
        Hunter = 4,
        Shaman = 8,
        Rogue = 16,
        Druid = 32,
        Warlock = 64,
        Mage = 128,
        Priest = 256,


        Tank = Warrior | Paladin | Druid | Warlock,
        Melee = Warrior | Paladin | Shaman | Rogue,
        Ranged = Hunter | Shaman | Druid | Warlock | Mage | Priest,
        DPS = Melee & Ranged,
        Healer = Paladin | Shaman | Druid | Priest
    }


    [Flags]
    public enum ClassCN
    {
        战士 = 1,
        圣骑士 = 2,
        猎人 = 4,
        萨满祭司 = 8,
        潜行者 = 16,
        德鲁伊 = 32,
        术士 = 64,
        法师 = 128,
        牧师 = 256,


        Tank = 战士 | 圣骑士 | 德鲁伊 | 术士,
        Melee = 战士 | 圣骑士 | 萨满祭司 | 潜行者,
        Ranged = 猎人 | 萨满祭司 | 德鲁伊 | 术士 | 法师 | 牧师,
        DPS = Melee & Ranged,
        Healer = 圣骑士 | 萨满祭司 | 德鲁伊 | 牧师
    }
}
