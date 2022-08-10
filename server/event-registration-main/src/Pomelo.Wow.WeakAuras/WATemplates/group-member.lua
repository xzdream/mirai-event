{
    ["c"] = {
        [1] = {
            ["iconSource"] = -1,
            ["authorOptions"] = {
            },
            ["yOffset"] = 0,
            ["anchorPoint"] = "CENTER",
            ["cooldownSwipe"] = true,
            ["cooldownEdge"] = false,
            ["actions"] = {
                ["start"] = {
                    ["do_custom"] = true,
                    ["custom"] = "local button = CreateFrame(\"Button\", \"resetAutoMarkButton\", UIParent, \"UIPanelButtonTemplate\")\nbutton:SetPoint(\"BOTTOMLEFT\", nil, \"BOTTOMLEFT\", 100, 0)\nbutton:SetSize(100,30)\nbutton:RegisterForClicks(\"AnyUp\", false)\nbutton:SetScript(\"OnClick\", function(self)\n        local members = split(_G[\"mirai_members\"], \",\")\n        for i=1, #members do\n            local name = getCharacterName(members[i])\n            if not UnitInRaid(name) then\n                InviteUnit(name)\n            end\n        end\nend)\n\nlocal fo = button:CreateFontString()\nfo:SetFont(\"Fonts/ARHei.TTF\",12)\nfo:SetPoint(\"TOPLEFT\", button, \"TOPLEFT\", 100/6,-40/4)\nfo:SetText(\"一键邀请\")\nbutton:SetFontString(fo)\naura_env.invite_btn = button;",
                },
                ["init"] = {
                    ["custom"] = "_G[\"mirai_members\"] = aura_env.config[\"members\"]\n\nfunction split(str,reps)\n    local resultStrList = {}\n    string.gsub(str,'[^'..reps..']+',function (w)\n            table.insert(resultStrList,w)\n    end)\n    return resultStrList\nend\n\nfunction string.indexOf(s, pattern, startIndex)\n    startIndex = startIndex or 0\n    local idx = string.find(s, pattern, startIndex, true)\n    return idx or -1\nend\n\nfunction getCharacterName(text)\n    local idx = string.indexOf(text, \"(\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction shortPlayerName(text)\n    local idx = string.indexOf(text, \"-\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction getClassName(text)\n    local idx = string.indexOf(text, \"(\")\n    local rightIdx = string.indexOf(text, \")\")\n    if idx == -1 or rightIdx == -1 then\n        return \"\"\n    end\n    \n    local ret = string.sub(text, idx + 1, rightIdx - 1)\n    return ret\nend\n\nfunction isCharacterInRegistrationList(character)\n    character = shortPlayerName(character)\n    local members = split(_G[\"mirai_members\"], \",\")\n    for i=1, #members do\n        local name = getCharacterName(members[i])\n        if character == name then\n            return true\n        end\n    end\n    \n    return false\nend\n\nfunction getColorizedCharacterName(name, class)\n    if class == \"战士\" then\n        return \"|cFFC79C6E\"..name..\"|r\"\n    elseif class == \"圣骑士\" then\n        return \"|cFFF58CBA\"..name..\"|r\"\n    elseif class == \"猎人\" then\n        return \"|cFFABD473\"..name..\"|r\"\n    elseif class == \"萨满祭司\" then\n        return \"|cFF0070DE\"..name..\"|r\"\n    elseif class == \"德鲁伊\" then\n        return \"|cFFFF7D0A\"..name..\"|r\"\n    elseif class == \"潜行者\" then\n        return \"|cFFFFF569\"..name..\"|r\"\n    elseif class == \"法师\" then\n        return \"|cFF69CCF0\"..name..\"|r\"\n    elseif class == \"牧师\" then\n        return \"|cFFFFFFFF\"..name..\"|r\"\n    elseif class == \"术士\" then\n        return \"|cFF9482C9\"..name..\"|r\"\n    else\n        local ret = WA_ClassColorName(name)\n        if string.len(ret) ~= 0 then\n            return ret\n        else\n            return name\n        end\n    end\nend",
                    ["do_custom"] = true,
                },
                ["finish"] = {
                    ["do_custom"] = true,
                    ["custom"] = "local button = aura_env.invite_btn\naura_env.invite_btn = nil\nbutton:Hide()\nbutton:SetParent(nil)\nbutton:ClearAllPoints()\nbutton = nil",
                },
            },
            ["triggers"] = {
                [1] = {
                    ["trigger"] = {
                        ["type"] = "unit",
                        ["use_incombat"] = false,
                        ["subeventSuffix"] = "_CAST_START",
                        ["event"] = "Conditions",
                        ["subeventPrefix"] = "SPELL",
                        ["spellIds"] = {
                        },
                        ["use_unit"] = true,
                        ["names"] = {
                        },
                        ["unit"] = "player",
                        ["debuffType"] = "HELPFUL",
                    },
                    ["untrigger"] = {
                    },
                },
                ["activeTriggerMode"] = -10,
            },
            ["internalVersion"] = 45,
            ["keepAspectRatio"] = false,
            ["animation"] = {
                ["start"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["main"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["finish"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
            },
            ["desaturate"] = false,
            ["subRegions"] = {
                [1] = {
                    ["text_shadowXOffset"] = 0,
                    ["text_text_format_s_format"] = "none",
                    ["text_text"] = "%s",
                    ["text_shadowColor"] = {
                        [1] = 0,
                        [2] = 0,
                        [3] = 0,
                        [4] = 1,
                    },
                    ["text_selfPoint"] = "AUTO",
                    ["text_automaticWidth"] = "Auto",
                    ["text_fixedWidth"] = 64,
                    ["anchorYOffset"] = 0,
                    ["text_justify"] = "CENTER",
                    ["rotateText"] = "NONE",
                    ["type"] = "subtext",
                    ["text_color"] = {
                        [1] = 1,
                        [2] = 1,
                        [3] = 1,
                        [4] = 1,
                    },
                    ["text_font"] = "Friz Quadrata TT",
                    ["text_shadowYOffset"] = 0,
                    ["text_wordWrap"] = "WordWrap",
                    ["text_visible"] = true,
                    ["text_anchorPoint"] = "INNER_BOTTOMRIGHT",
                    ["text_fontSize"] = 12,
                    ["anchorXOffset"] = 0,
                    ["text_fontType"] = "OUTLINE",
                },
                [2] = {
                    ["glowFrequency"] = 0.25,
                    ["type"] = "subglow",
                    ["glowXOffset"] = 0,
                    ["glowType"] = "buttonOverlay",
                    ["glowLength"] = 10,
                    ["glowYOffset"] = 0,
                    ["glowColor"] = {
                        [1] = 1,
                        [2] = 1,
                        [3] = 1,
                        [4] = 1,
                    },
                    ["useGlowColor"] = false,
                    ["glow"] = false,
                    ["glowScale"] = 1,
                    ["glowThickness"] = 1,
                    ["glowLines"] = 8,
                    ["glowBorder"] = false,
                },
            },
            ["height"] = 1,
            ["load"] = {
                ["size"] = {
                    ["multi"] = {
                    },
                },
                ["spec"] = {
                    ["multi"] = {
                    },
                },
                ["class"] = {
                    ["multi"] = {
                    },
                },
                ["talent"] = {
                    ["multi"] = {
                    },
                },
            },
            ["regionType"] = "icon",
            ["icon"] = true,
            ["cooldown"] = false,
            ["displayIcon"] = 135978,
            ["zoom"] = 0,
            ["cooldownTextDisabled"] = false,
            ["alpha"] = 1,
            ["tocversion"] = 20502,
            ["id"] = "一键邀请",
            ["color"] = {
                [1] = 1,
                [2] = 1,
                [3] = 1,
                [4] = 1,
            },
            ["frameStrata"] = 1,
            ["anchorFrameType"] = "SCREEN",
            ["xOffset"] = -1980,
            ["uid"] = "zd5(q(aOTi0",
            ["inverse"] = false,
            ["config"] = {
            },
            ["width"] = 1,
            ["conditions"] = {
            },
            ["information"] = {
            },
            ["selfPoint"] = "CENTER",
        },
        [2] = {
            ["iconSource"] = 0,
            ["authorOptions"] = {
                [1] = {
                    ["type"] = "input",
                    ["useDesc"] = false,
                    ["width"] = 2,
                    ["default"] = "",
                    ["key"] = "members",
                    ["name"] = "报名人员，用逗号分割",
                    ["length"] = 10,
                    ["multiline"] = true,
                    ["useLength"] = false,
                },
                [2] = {
                    ["type"] = "input",
                    ["useDesc"] = false,
                    ["width"] = 2,
                    ["default"] = "",
                    ["key"] = "whisperMessage",
                    ["name"] = "密语进组内容",
                    ["length"] = 10,
                    ["multiline"] = false,
                    ["useLength"] = false,
                },
            },
            ["yOffset"] = 0,
            ["anchorPoint"] = "CENTER",
            ["cooldownSwipe"] = true,
            ["cooldownEdge"] = false,
            ["actions"] = {
                ["start"] = {
                },
                ["init"] = {
                    ["do_custom"] = true,
                    ["custom"] = "_G[\"mirai_members\"] = aura_env.config[\"members\"]\n\nfunction split(str,reps)\n    local resultStrList = {}\n    string.gsub(str,'[^'..reps..']+',function (w)\n            table.insert(resultStrList,w)\n    end)\n    return resultStrList\nend\n\nfunction string.indexOf(s, pattern, startIndex)\n    startIndex = startIndex or 0\n    local idx = string.find(s, pattern, startIndex, true)\n    return idx or -1\nend\n\nfunction getCharacterName(text)\n    local idx = string.indexOf(text, \"(\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction shortPlayerName(text)\n    local idx = string.indexOf(text, \"-\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction getClassName(text)\n    local idx = string.indexOf(text, \"(\")\n    local rightIdx = string.indexOf(text, \")\")\n    if idx == -1 or rightIdx == -1 then\n        return \"\"\n    end\n    \n    local ret = string.sub(text, idx + 1, rightIdx - 1)\n    return ret\nend\n\nfunction isCharacterInRegistrationList(character)\n    character = shortPlayerName(character)\n    local members = split(_G[\"mirai_members\"], \",\")\n    for i=1, #members do\n        local name = getCharacterName(members[i])\n        if character == name then\n            return true\n        end\n    end\n    \n    return false\nend\n\nfunction getColorizedCharacterName(name, class)\n    if class == \"战士\" then\n        return \"|cFFC79C6E\"..name..\"|r\"\n    elseif class == \"圣骑士\" then\n        return \"|cFFF58CBA\"..name..\"|r\"\n    elseif class == \"猎人\" then\n        return \"|cFFABD473\"..name..\"|r\"\n    elseif class == \"萨满祭司\" then\n        return \"|cFF0070DE\"..name..\"|r\"\n    elseif class == \"德鲁伊\" then\n        return \"|cFFFF7D0A\"..name..\"|r\"\n    elseif class == \"潜行者\" then\n        return \"|cFFFFF569\"..name..\"|r\"\n    elseif class == \"法师\" then\n        return \"|cFF69CCF0\"..name..\"|r\"\n    elseif class == \"牧师\" then\n        return \"|cFFFFFFFF\"..name..\"|r\"\n    elseif class == \"术士\" then\n        return \"|cFF9482C9\"..name..\"|r\"\n    else\n        local ret = WA_ClassColorName(name)\n        if string.len(ret) ~= 0 then\n            return ret\n        else\n            return name\n        end\n    end\nend",
                },
                ["finish"] = {
                },
            },
            ["triggers"] = {
                [1] = {
                    ["trigger"] = {
                        ["type"] = "custom",
                        ["subeventSuffix"] = "_CAST_START",
                        ["event"] = "Health",
                        ["subeventPrefix"] = "SPELL",
                        ["custom_hide"] = "timed",
                        ["events"] = "CHAT_MSG_WHISPER",
                        ["custom"] = "function(event, text, playerName)\n    if event == \"CHAT_MSG_WHISPER\" then\n        if text ~= aura_env.config[\"whisperMessage\"] then\n            return\n        end\n        \n        if not isCharacterInRegistrationList(playerName) then\n            SendChatMessage(\"您没有报名本次活动，无法自动邀请您进入团队\", \"WHISPER\", \"Common\", playerName);\n            return\n        end\n        \n        InviteUnit(playerName)\n    end\nend",
                        ["spellIds"] = {
                        },
                        ["custom_type"] = "event",
                        ["names"] = {
                        },
                        ["unit"] = "player",
                        ["debuffType"] = "HELPFUL",
                    },
                    ["untrigger"] = {
                    },
                },
                ["activeTriggerMode"] = -10,
            },
            ["internalVersion"] = 45,
            ["keepAspectRatio"] = false,
            ["animation"] = {
                ["start"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["main"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["finish"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
            },
            ["desaturate"] = false,
            ["subRegions"] = {
                [1] = {
                    ["text_shadowXOffset"] = 0,
                    ["text_text_format_s_format"] = "none",
                    ["text_text"] = "%s",
                    ["text_shadowColor"] = {
                        [1] = 0,
                        [2] = 0,
                        [3] = 0,
                        [4] = 1,
                    },
                    ["text_selfPoint"] = "AUTO",
                    ["text_automaticWidth"] = "Auto",
                    ["text_fixedWidth"] = 64,
                    ["anchorYOffset"] = 0,
                    ["text_justify"] = "CENTER",
                    ["rotateText"] = "NONE",
                    ["type"] = "subtext",
                    ["text_color"] = {
                        [1] = 1,
                        [2] = 1,
                        [3] = 1,
                        [4] = 1,
                    },
                    ["text_font"] = "Friz Quadrata TT",
                    ["text_shadowYOffset"] = 0,
                    ["text_wordWrap"] = "WordWrap",
                    ["text_visible"] = true,
                    ["text_anchorPoint"] = "INNER_BOTTOMRIGHT",
                    ["text_fontSize"] = 12,
                    ["anchorXOffset"] = 0,
                    ["text_fontType"] = "OUTLINE",
                },
                [2] = {
                    ["glowFrequency"] = 0.25,
                    ["type"] = "subglow",
                    ["glowXOffset"] = 0,
                    ["glowType"] = "buttonOverlay",
                    ["glowLength"] = 10,
                    ["glowYOffset"] = 0,
                    ["glowColor"] = {
                        [1] = 1,
                        [2] = 1,
                        [3] = 1,
                        [4] = 1,
                    },
                    ["useGlowColor"] = false,
                    ["glow"] = false,
                    ["glowScale"] = 1,
                    ["glowThickness"] = 1,
                    ["glowLines"] = 8,
                    ["glowBorder"] = false,
                },
            },
            ["height"] = 64,
            ["load"] = {
                ["size"] = {
                    ["multi"] = {
                    },
                },
                ["spec"] = {
                    ["multi"] = {
                    },
                },
                ["class"] = {
                    ["multi"] = {
                    },
                },
                ["talent"] = {
                    ["multi"] = {
                    },
                },
            },
            ["regionType"] = "icon",
            ["icon"] = true,
            ["cooldown"] = false,
            ["displayIcon"] = 136058,
            ["zoom"] = 0,
            ["cooldownTextDisabled"] = false,
            ["alpha"] = 1,
            ["tocversion"] = 20502,
            ["id"] = "密语自动邀请",
            ["color"] = {
                [1] = 1,
                [2] = 1,
                [3] = 1,
                [4] = 1,
            },
            ["frameStrata"] = 1,
            ["anchorFrameType"] = "SCREEN",
            ["xOffset"] = 0,
            ["uid"] = "TTDwQrKX9pA",
            ["inverse"] = false,
            ["config"] = {
                ["whisperMessage"] = "<WHISPER_MSG>",
                ["members"] = "<MEMBER_LIST>",
            },
            ["width"] = 64,
            ["conditions"] = {
            },
            ["information"] = {
            },
            ["selfPoint"] = "CENTER",
        },
        [3] = {
            ["outline"] = "OUTLINE",
            ["xOffset"] = 0,
            ["displayText_format_p_time_dynamic_threshold"] = 60,
            ["customText"] = "function()\n    local members = split(_G[\"mirai_members\"], \",\")\n    if #members == 0 then\n        return \"\"\n    end\n\n    local ret = \"|cffff0000未进组人员：|r\\r\\n\"\n\n    for i=1, #members do\n        local name = getCharacterName(members[i])\n        if not UnitInRaid(name) then\n            ret = ret..getColorizedCharacterName(getCharacterName(members[i]), getClassName(members[i]))..\" \\r\\n\"\n        end\n    end\n\n    return ret\nend",
            ["yOffset"] = 0,
            ["anchorPoint"] = "CENTER",
            ["displayText_format_p_time_format"] = 0,
            ["customTextUpdate"] = "update",
            ["automaticWidth"] = "Auto",
            ["actions"] = {
                ["start"] = {
                },
                ["init"] = {
                    ["do_custom"] = true,
                    ["custom"] = "_G[\"mirai_members\"] = aura_env.config[\"members\"]\n\nfunction split(str,reps)\n    local resultStrList = {}\n    string.gsub(str,'[^'..reps..']+',function (w)\n            table.insert(resultStrList,w)\n    end)\n    return resultStrList\nend\n\nfunction string.indexOf(s, pattern, startIndex)\n    startIndex = startIndex or 0\n    local idx = string.find(s, pattern, startIndex, true)\n    return idx or -1\nend\n\nfunction getCharacterName(text)\n    local idx = string.indexOf(text, \"(\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction shortPlayerName(text)\n    local idx = string.indexOf(text, \"-\")\n    if idx == -1 then\n        return text\n    end\n    \n    return string.sub(text, 0, idx - 1)\nend\n\nfunction getClassName(text)\n    local idx = string.indexOf(text, \"(\")\n    local rightIdx = string.indexOf(text, \")\")\n    if idx == -1 or rightIdx == -1 then\n        return \"\"\n    end\n    \n    local ret = string.sub(text, idx + 1, rightIdx - 1)\n    return ret\nend\n\nfunction isCharacterInRegistrationList(character)\n    character = shortPlayerName(character)\n    local members = split(_G[\"mirai_members\"], \",\")\n    for i=1, #members do\n        local name = getCharacterName(members[i])\n        if character == name then\n            return true\n        end\n    end\n    \n    return false\nend\n\nfunction getColorizedCharacterName(name, class)\n    if class == \"战士\" then\n        return \"|cFFC79C6E\"..name..\"|r\"\n    elseif class == \"圣骑士\" then\n        return \"|cFFF58CBA\"..name..\"|r\"\n    elseif class == \"猎人\" then\n        return \"|cFFABD473\"..name..\"|r\"\n    elseif class == \"萨满祭司\" then\n        return \"|cFF0070DE\"..name..\"|r\"\n    elseif class == \"德鲁伊\" then\n        return \"|cFFFF7D0A\"..name..\"|r\"\n    elseif class == \"潜行者\" then\n        return \"|cFFFFF569\"..name..\"|r\"\n    elseif class == \"法师\" then\n        return \"|cFF69CCF0\"..name..\"|r\"\n    elseif class == \"牧师\" then\n        return \"|cFFFFFFFF\"..name..\"|r\"\n    elseif class == \"术士\" then\n        return \"|cFF9482C9\"..name..\"|r\"\n    else\n        local ret = WA_ClassColorName(name)\n        if string.len(ret) ~= 0 then\n            return ret\n        else\n            return name\n        end\n    end\nend",
                },
                ["finish"] = {
                },
            },
            ["triggers"] = {
                [1] = {
                    ["trigger"] = {
                        ["ingroup"] = {
                            ["multi"] = {
                                ["raid"] = true,
                            },
                        },
                        ["custom_hide"] = "custom",
                        ["subeventSuffix"] = "_CAST_START",
                        ["type"] = "custom",
                        ["custom"] = "function(event)\n    return true\nend",
                        ["event"] = "Conditions",
                        ["names"] = {
                        },
                        ["events"] = "GROUP_ROSTER_UPDATE,PLAYER_TARGET_CHANGED",
                        ["use_ingroup"] = false,
                        ["spellIds"] = {
                        },
                        ["custom_type"] = "event",
                        ["use_unit"] = true,
                        ["subeventPrefix"] = "SPELL",
                        ["unit"] = "player",
                        ["debuffType"] = "HELPFUL",
                    },
                    ["untrigger"] = {
                        ["custom"] = "function(event)\n    return false\nend",
                    },
                },
                ["disjunctive"] = "any",
                ["customTriggerLogic"] = "function(triggers)\n    return true\nend",
                ["activeTriggerMode"] = -10,
            },
            ["displayText_format_p_format"] = "timed",
            ["internalVersion"] = 45,
            ["wordWrap"] = "WordWrap",
            ["font"] = "默认",
            ["subRegions"] = {
            },
            ["load"] = {
                ["use_ingroup"] = true,
                ["ingroup"] = {
                    ["single"] = "raid",
                },
                ["talent"] = {
                    ["multi"] = {
                    },
                },
                ["use_combat"] = false,
                ["class"] = {
                    ["multi"] = {
                    },
                },
                ["spec"] = {
                    ["multi"] = {
                    },
                },
                ["size"] = {
                    ["multi"] = {
                    },
                },
            },
            ["fontSize"] = 15,
            ["shadowXOffset"] = 1,
            ["regionType"] = "text",
            ["displayText_format_p_time_precision"] = 1,
            ["displayText"] = "%c",
            ["animation"] = {
                ["start"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["main"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
                ["finish"] = {
                    ["type"] = "none",
                    ["easeStrength"] = 3,
                    ["duration_type"] = "seconds",
                    ["easeType"] = "none",
                },
            },
            ["fixedWidth"] = 200,
            ["justify"] = "LEFT",
            ["tocversion"] = 20502,
            ["id"] = "未进组报名人员名单",
            ["color"] = {
                [1] = 1,
                [2] = 1,
                [3] = 1,
                [4] = 1,
            },
            ["frameStrata"] = 1,
            ["anchorFrameType"] = "SCREEN",
            ["shadowYOffset"] = -1,
            ["config"] = {
                ["members"] = "<MEMBER_LIST>",
            },
            ["authorOptions"] = {
                [1] = {
                    ["type"] = "input",
                    ["useDesc"] = false,
                    ["width"] = 2,
                    ["default"] = "",
                    ["key"] = "members",
                    ["name"] = "报名人员，用逗号分割",
                    ["length"] = 10,
                    ["multiline"] = true,
                    ["useLength"] = false,
                },
            },
            ["uid"] = "ko6S9l80dbi",
            ["shadowColor"] = {
                [1] = 0,
                [2] = 0,
                [3] = 0,
                [4] = 1,
            },
            ["conditions"] = {
            },
            ["information"] = {
            },
            ["selfPoint"] = "BOTTOM",
        },
    },
    ["m"] = "d",
    ["d"] = {
        ["backdropColor"] = {
            [1] = 1,
            [2] = 1,
            [3] = 1,
            [4] = 0.5,
        },
        ["borderBackdrop"] = "Blizzard Tooltip",
        ["authorOptions"] = {
        },
        ["scale"] = 1,
        ["information"] = {
        },
        ["border"] = false,
        ["yOffset"] = -19.301147460938,
        ["anchorPoint"] = "CENTER",
        ["borderSize"] = 2,
        ["xOffset"] = 230.07470703125,
        ["borderColor"] = {
            [1] = 0,
            [2] = 0,
            [3] = 0,
            [4] = 1,
        },
        ["uid"] = "sbMLU6UYBts",
        ["groupIcon"] = 132161,
        ["actions"] = {
            ["start"] = {
            },
            ["init"] = {
            },
            ["finish"] = {
            },
        },
        ["triggers"] = {
            [1] = {
                ["trigger"] = {
                    ["names"] = {
                    },
                    ["type"] = "aura2",
                    ["spellIds"] = {
                    },
                    ["subeventSuffix"] = "_CAST_START",
                    ["unit"] = "player",
                    ["subeventPrefix"] = "SPELL",
                    ["event"] = "Health",
                    ["debuffType"] = "HELPFUL",
                },
                ["untrigger"] = {
                },
            },
        },
        ["borderInset"] = 1,
        ["internalVersion"] = 45,
        ["tocversion"] = 20502,
        ["animation"] = {
            ["start"] = {
                ["type"] = "none",
                ["easeStrength"] = 3,
                ["duration_type"] = "seconds",
                ["easeType"] = "none",
            },
            ["main"] = {
                ["type"] = "none",
                ["easeStrength"] = 3,
                ["duration_type"] = "seconds",
                ["easeType"] = "none",
            },
            ["finish"] = {
                ["type"] = "none",
                ["easeStrength"] = 3,
                ["duration_type"] = "seconds",
                ["easeType"] = "none",
            },
        },
        ["id"] = "【Mirai】团队成员助手",
        ["selfPoint"] = "CENTER",
        ["frameStrata"] = 1,
        ["desc"] = "未进组成员列表、密语自动进组",
        ["anchorFrameType"] = "SCREEN",
        ["config"] = {
        },
        ["borderOffset"] = 4,
        ["subRegions"] = {
        },
        ["regionType"] = "group",
        ["conditions"] = {
        },
        ["load"] = {
            ["size"] = {
                ["multi"] = {
                },
            },
            ["spec"] = {
                ["multi"] = {
                },
            },
            ["class"] = {
                ["multi"] = {
                },
            },
            ["talent"] = {
                ["multi"] = {
                },
            },
        },
        ["borderEdge"] = "Square Full White",
    },
    ["s"] = "3.7.1-4-g99f584c",
    ["v"] = 1421,
}