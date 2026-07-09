(function() {
    var LUMEN_RATE = 200;
    var MAX_DAY = 3650;

    function $(id) { return document.getElementById(id); }

    function num(id) {
        var v = parseFloat($(id).value);
        return isNaN(v) || v < 0 ? 0 : v;
    }

    function numSigned(id) {
        var v = parseFloat($(id).value);
        return isNaN(v) ? 0 : v;
    }

    function checked(id) { return $(id).checked; }

    // ===== 课题纪录数值限制 =====
    function clampBP() {
        var total28 = num("cpBPNormal28");
        var adv28 = num("cpBPAdvanced28");
        var max28 = num("cpBPMaxed28");
        if (adv28 > total28) { $("cpBPAdvanced28").value = total28;
            adv28 = total28; }
        if (max28 > adv28) { $("cpBPMaxed28").value = adv28;
            max28 = adv28; }
        var total14 = num("cpBPNormal14");
        var adv14 = num("cpBPAdvanced14");
        var max14 = num("cpBPMaxed14");
        if (adv14 > total14) { $("cpBPAdvanced14").value = total14;
            adv14 = total14; }
        if (max14 > adv14) { $("cpBPMaxed14").value = adv14;
            max14 = adv14; }
    }
    ["cpBPNormal28", "cpBPAdvanced28", "cpBPMaxed28", "cpBPNormal14", "cpBPAdvanced14", "cpBPMaxed14"].forEach(
    function(id) {
        $(id).addEventListener("input", clampBP);
        $(id).addEventListener("change", clampBP);
    });

    // ===== 每日试训与核心课题行可见性 =====
    function toggleCourseVisibility() {
        if (checked("cpDailyTrial")) {
            $("cpCourseRow").classList.remove("cp-hide");
            $("cpCourseHint").classList.remove("cp-hide");
        } else {
            $("cpCourseRow").classList.add("cp-hide");
            $("cpCourseHint").classList.add("cp-hide");
        }
    }
    $("cpDailyTrial").addEventListener("change", toggleCourseVisibility);
    toggleCourseVisibility();

    // ===== 每月刷新行可见性 =====
    function toggleRefreshVisibility() {
        if (checked("cpMonthlyRefresh")) {
            $("cpRefreshRow").classList.remove("cp-hide");
        } else {
            $("cpRefreshRow").classList.add("cp-hide");
        }
    }
    $("cpMonthlyRefresh").addEventListener("change", toggleRefreshVisibility);
    toggleRefreshVisibility();

    // ===== 自定义来源 =====
    function addCustomRow() {
        var card = document.createElement("div");
        card.className = "cp-custom-card";
        card.innerHTML =
            '<div class="cp-field-group input-name"><label>来源名称:</label><input type="text" placeholder="如:牢猫爆点银芯、节日…" style="width:100%;" /></div>' +
            '<div class="cp-field-group"><label>银芯:</label><input type="number" class="input-num" min="0" value="0" /></div>' +
            '<div class="cp-field-group"><label>流明之芯:</label><input type="number" class="input-num" min="0" value="0" /></div>' +
            '<div class="cp-field-group"><label>无垢之芯:</label><input type="number" class="input-num" min="0" value="0" /></div>' +
            '<div class="cp-field-group"><label>几天拿满:</label><input type="number" class="input-delay" min="0" value="0" placeholder="0" /></div>' +
            '<div class="cp-field-group"><label>源液花费:</label><input type="number" class="input-cost" min="0" value="0" style="width:55px;" /></div>' +
            '<button type="button" class="cp-remove-btn">删除</button>';
        card.querySelector(".cp-remove-btn").addEventListener("click", function() { card.remove(); });
        $("cpCustomContainer").appendChild(card);
    }
    $("cpAddCustomRow").addEventListener("click", addCustomRow);

    function readCustomRows() {
        var cards = $("cpCustomContainer").querySelectorAll(".cp-custom-card");
        var out = [];
        var unnamedCount = 0;
        cards.forEach(function(card) {
            var inputs = card.querySelectorAll("input");
            var rawName = inputs[0].value.trim();
            var silver = parseFloat(inputs[1].value) || 0;
            var lumen = parseFloat(inputs[2].value) || 0;
            var pure = parseFloat(inputs[3].value) || 0;
            var delay = parseFloat(inputs[4].value) || 0;
            var cost = parseFloat(inputs[5].value) || 0;
            if (silver || lumen || pure || delay || cost) {
                var name = rawName || ("自定义来源" + (++unnamedCount));
                out.push({ name: name, silver: silver, lumen: lumen, pure: pure, delay: delay,
                    originDelay: delay, cost: cost });
            }
        });
        return out;
    }

    // ===== 工具 =====
    function fmt(n) {
        if (Math.abs(n - Math.round(n)) < 0.001) return Math.round(n).toString();
        return n.toFixed(1);
    }

    // ===== 动态更新月卡花费显示 =====
    function updateMonthlyCost() {
        var days = num("cpMonthlyCardDays");
        var cost = 300 * Math.ceil(days / 30);
        document.getElementById("cpMonthlyCardCostDisplay").textContent = cost;
    }
    document.getElementById("cpMonthlyCardDays").addEventListener("input", updateMonthlyCost);
    document.getElementById("cpMonthlyCardDays").addEventListener("change", updateMonthlyCost);
    updateMonthlyCost();

    // ===== 核心课题源液花费显示 =====
    function updateCourseCost() {
        var cost = checked("cpCourseBuy") ? 1280 : 0;
        document.getElementById("cpCourseCostDisplay").textContent = "源液花费：" + cost;
    }
    $("cpCourseBuy").addEventListener("change", updateCourseCost);
    updateCourseCost();

    // ===== 预购纪行冷却期计算（支持自定义） =====
    function updatePreorderCooldown() {
        var count = num("cpPreorderBuyCount");
        var cooldownEl = document.getElementById("cpPreorderCooldown");
        var daysEl = document.getElementById("cpPreorderCooldownDays");
        var customInput = document.getElementById("cpPreorderCooldownCustom");
        
        if (count > 0) {
            var customDays = parseFloat(customInput.value);
            if (isNaN(customDays) || customDays < 0) customDays = 40;
            cooldownEl.style.display = "block";
            daysEl.textContent = customDays;
        } else {
            cooldownEl.style.display = "none";
        }
    }
    $("cpPreorderBuyCount").addEventListener("input", updatePreorderCooldown);
    $("cpPreorderBuyCount").addEventListener("change", updatePreorderCooldown);
    document.getElementById("cpPreorderCooldownCustom").addEventListener("input", updatePreorderCooldown);
    document.getElementById("cpPreorderCooldownCustom").addEventListener("change", updatePreorderCooldown);
    updatePreorderCooldown();

    // ================================================================
    //  核心模拟函数
    // ================================================================
    function simulateTarget(tSE, cSE, tPure, cPure, config) {
        var day = 0;
        var maxDay = MAX_DAY;
        var seDone = (tSE <= cSE);
        var pureDone = (tPure <= cPure);
        var reachedSE = seDone;
        var reachedPure = pureDone;
        var fDaySE = 0,
            fDayPure = 0;

        var st = {
            shopSilver: 0,
            missionSilver: 0,
            dailyTrialSilver: 0,
            dailyTrialPure: 0,
            weeklySilver: 0,
            weeklyPure: 0,
            trainSilver: 0,
            trainCountActual: 0,
            modeSilver: 0,
            modePure: 0,
            modeCounts: { mode1: 0, mode2: 0, mode3: 0, mode4: 0 },
            refreshSilver: 0,
            refreshPure: 0,
            monthlySilver: 0,
            monthlyCardLumpSilver: 0,
            codeSilver: 0,
            codePure: 0,
            journeyPure: 0,
            actualEvents: 0,
            eventDetails: [],
            eventSilver: 0,
            eventLumen: 0,
            eventPure: 0,
            bp28Silver: 0,
            bp28Lumen: 0,
            bp28Pure: 0,
            bp28ActualCount: 0,
            bp28ActualAdv: 0,
            bp28ActualMax: 0,
            bp14Silver: 0,
            bp14Lumen: 0,
            bp14Pure: 0,
            bp14ActualCount: 0,
            bp14ActualAdv: 0,
            bp14ActualMax: 0,
            preorderSilver: 0,
            preorderLumen: 0,
            preorderFreeSilver: 0,
            preorderCyclesActual: 0,
            destinyLumen: 0,
            destinyPure: 0,
            destinyCyclesActual: 0,
            popupSilver: 0,
            popupLumen: 0,
            popupPure: 0,
            popupCost: 0,
            popupUsedDetail: [],
            shopPackLumen: 0,
            shopPackCost: 0,
            shopPackUsedMonths: 0,
            secretSilver: 0,
            secretPure: 0,
            secretActualCount: 0,
            secretAdvSilver: 0,
            secretAdvLumen: 0,
            secretAdvActualCount: 0,
            lumenSupplyLumen: 0,
            customCost: 0,
            monthlyCardCost: 0,
            courseCost: 0
        };

        var customs = JSON.parse(JSON.stringify(config.customs));
        customs.forEach(function(c) {
            c.earnedSE = 0;
            c.earnedPure = 0;
            if (c.delay <= 0) {
                c.earnedSE = c.silver + c.lumen * LUMEN_RATE;
                c.earnedPure = c.pure;
                c.delay = -1;
            }
        });

        var pendingEvents = [];
        var eventClaimDays = config.eventClaimDays > 0 ? config.eventClaimDays : 1;
        var spawnedEvents = 0;
        var eventConcurrent = config.eventConcurrent > 0 ? Math.floor(config.eventConcurrent) : 1;
        var eventInstantProcessed = false;

        var modeDefs = [
            { id: 'mode1', seasons: config.mode1Seasons, silver: 250, pure: 5, instant: config.mode1Instant },
            { id: 'mode2', seasons: config.mode2Seasons, silver: 250, pure: 5, instant: config.mode2Instant },
            { id: 'mode3', seasons: config.mode3Seasons, silver: 250, pure: 5, instant: config.mode3Instant },
            { id: 'mode4', seasons: config.mode4Seasons, silver: 250, pure: 5, instant: config.mode4Instant }
        ];

        var bpNorm28 = config.bpNormal28;
        var bpAdv28 = Math.min(config.bpAdvanced28, bpNorm28);
        var bpMax28 = Math.min(config.bpMaxed28, bpAdv28);
        var bpGift28 = config.bpGift28;

        var bpNorm14 = config.bpNormal14;
        var bpAdv14 = Math.min(config.bpAdvanced14, bpNorm14);
        var bpMax14 = Math.min(config.bpMaxed14, bpAdv14);
        var bpGift14 = config.bpGift14;

        var bp28EarnedCount = 0;
        var bp14EarnedCount = 0;

        var preorderSchedule = [
            { offset: 0, silver: 2000, lumen: 0 },
            { offset: 14, silver: 2000, lumen: 10 },
            { offset: 15, silver: 4000, lumen: 0 },
            { offset: 18, silver: 2000, lumen: 10 },
            { offset: 25, silver: 4000, lumen: 0 },
            { offset: 32, silver: 2000, lumen: 10 },
            { offset: 40, silver: 4000, lumen: 0 }
        ];
        var preorderQueue = [];
        var preorderBuyCount = config.preorderBuyCount || 0;
        var cooldownInterval = config.preorderCooldown || 40;
        for (var pi = 0; pi < preorderBuyCount; pi++) {
            preorderQueue.push({ startOffset: pi * cooldownInterval, index: pi });
        }

        var destinyPeriod = parseInt(config.destinyPeriod) || 28;
        var destinyJoinPeriods = config.destinyJoinPeriods || 0;
        var destinyBuyCount = config.destinyBuyCount || 0;
        var destinyInstant = config.destinyInstant || false;

        var popupQueue = [];
        var c60 = config.popup60Count || 0;
        var c120 = config.popup120Count || 0;
        var c180 = config.popup180Count || 0;
        while (c60 > 0 || c120 > 0 || c180 > 0) {
            if (c60 > 0) { popupQueue.push('60');
                c60--; }
            if (c120 > 0) { popupQueue.push('120');
                c120--; }
            if (c180 > 0) { popupQueue.push('180');
                c180--; }
        }
        var popupQueueCopy = popupQueue.slice();

        var pack1Months = config.shopPack1 ? Math.min(Math.floor(config.shopPack1Months || 0), 12) : 0;
        var pack2Months = config.shopPack2 ? Math.min(Math.floor(config.shopPack2Months || 0), 12) : 0;
        var pack3Months = config.shopPack3 ? Math.min(Math.floor(config.shopPack3Months || 0), 12) : 0;
        var packLumenPerHit = (pack1Months > 0 ? 20 : 0) + (pack2Months > 0 ? 40 : 0) + (pack3Months > 0 ? 60 : 0);
        var packCostPerHit = (pack1Months > 0 ? 888 : 0) + (pack2Months > 0 ? 1888 : 0) + (pack3Months > 0 ? 2888 :
            0);
        var packMonthsMax = Math.max(pack1Months, pack2Months, pack3Months);
        var packActive = packLumenPerHit > 0 && packMonthsMax > 0;
        var packMonthsEarned = 0;

        var secretCount = config.secretCount;
        var secretAdv = config.secretAdvancedCount;

        var customTotalCost = 0;
        customs.forEach(function(c) { customTotalCost += c.cost || 0; });

        var preorderCycles = config.preorderCycles || 0;

        var monthlyCardDays = config.hasMonthly ? config.maxMonthlyDays : 0;
        var monthlyCardCost = 0;
        if (config.hasMonthly && monthlyCardDays > 0) {
            monthlyCardCost = 300 * Math.ceil(monthlyCardDays / 30);
            st.monthlyCardCost = monthlyCardCost;
        }

        if (config.hasCourse && config.maxCourseDays > 0) {
            st.courseCost = 1280;
        }

        var monthlyCardLumpGiven = false;

        // =============================================================
        // 阶段1: 处理所有「立即计算」的一次性收益
        // =============================================================
        function processInstantRewards() {
            if (config.hasWeekly && config.weeklyInstant) {
                st.weeklySilver += 500;
                st.weeklyPure += 10;
            }

            if (config.trainSilverPerHit > 0 && config.trainCount > 0 && config.trainInstant) {
                st.trainSilver += config.trainSilverPerHit * config.trainCount;
                st.trainCountActual = config.trainCount;
            }

            modeDefs.forEach(function(m) {
                if (m.seasons > 0 && m.instant) {
                    st.modeSilver += m.silver * m.seasons;
                    st.modePure += m.pure * m.seasons;
                    st.modeCounts[m.id] = (st.modeCounts[m.id] || 0) + m.seasons;
                }
            });

            if (config.eventCountTotal > 0 && config.eventInstant) {
                st.eventSilver += config.eventSilverSingle * config.eventCountTotal;
                st.eventLumen += 6 * config.eventCountTotal;
                st.eventPure += 6 * config.eventCountTotal;
                st.actualEvents = config.eventCountTotal;
                eventInstantProcessed = true;
            }

            if (config.bpInstant28 && bpNorm28 > 0) {
                st.bp28Pure += bpNorm28 * 12;
                st.bp28Silver += bpAdv28 * 2500;
                st.bp28Lumen += (bpAdv28 * 12);
                if (bpGift28 && bpMax28 > 0) {
                    st.bp28Lumen += bpMax28 * 5;
                }
                bp28EarnedCount = bpNorm28;
                st.bp28ActualCount = bpNorm28;
                st.bp28ActualAdv = bpAdv28;
                st.bp28ActualMax = bpMax28;
            }

            if (config.bpInstant14 && bpNorm14 > 0) {
                st.bp14Pure += bpNorm14 * 12;
                st.bp14Silver += bpAdv14 * 2500;
                st.bp14Lumen += (bpAdv14 * 12);
                if (bpGift14 && bpMax14 > 0) {
                    st.bp14Lumen += bpMax14 * 5;
                }
                bp14EarnedCount = bpNorm14;
                st.bp14ActualCount = bpNorm14;
                st.bp14ActualAdv = bpAdv14;
                st.bp14ActualMax = bpMax14;
            }

            if (destinyInstant) {
                if (destinyJoinPeriods > 0) {
                    st.destinyPure += 30 * destinyJoinPeriods;
                    st.destinyCyclesActual = destinyJoinPeriods;
                }
                if (destinyBuyCount > 0) {
                    var maxPeriodsForBuy = Math.min(destinyBuyCount, destinyJoinPeriods || destinyBuyCount);
                    st.destinyLumen += 60 * maxPeriodsForBuy;
                    if (st.destinyCyclesActual === 0) st.destinyCyclesActual = maxPeriodsForBuy;
                }
            }

            if (config.secretCount > 0) {
                st.secretSilver += config.secretCount * 2000;
                st.secretPure += config.secretCount * 40;
                st.secretActualCount = config.secretCount;
            }
            if (config.secretAdvancedCount > 0) {
                var actualAdv = config.secretAdvancedCount;
                st.secretAdvSilver += actualAdv * 2000;
                st.secretAdvLumen += actualAdv * 40;
                st.secretAdvActualCount = actualAdv;
            }

            if (config.lumenSupplyBuy) {
                st.lumenSupplyLumen += 10;
            }

            st.codeSilver += config.codeCount * 500;
            st.codePure += config.codeCount * 5;

            st.preorderFreeSilver += preorderCycles * 100;
            st.preorderCyclesActual = preorderCycles;

            st.journeyPure += config.journeyPure;

            if (config.popupInstant && popupQueueCopy.length > 0) {
                var tempQueue = popupQueueCopy.slice();
                tempQueue.forEach(function(tier) {
                    var cost = 0,
                        silver = 0,
                        lumen = 0,
                        pure = 0;
                    if (tier === '60') { cost = 60;
                        silver = 60;
                        lumen = 2;
                        pure = 1; }
                    if (tier === '120') { cost = 120;
                        silver = 120;
                        lumen = 4;
                        pure = 2; }
                    if (tier === '180') { cost = 180;
                        silver = 180;
                        lumen = 6;
                        pure = 3; }
                    st.popupSilver += silver;
                    st.popupLumen += lumen;
                    st.popupPure += pure;
                    st.popupCost += cost;
                    st.popupUsedDetail.push(tier);
                });
                popupQueueCopy = [];
            }

            if (config.shopPackInstant && packActive && packMonthsMax > 0) {
                st.shopPackLumen += packLumenPerHit * packMonthsMax;
                st.shopPackCost += packCostPerHit * packMonthsMax;
                packMonthsEarned = packMonthsMax;
            }

            customs.forEach(function(c) {
                if (c.delay <= 0) {
                    c.earnedSE = c.silver + c.lumen * LUMEN_RATE;
                    c.earnedPure = c.pure;
                }
                st.customCost += (c.cost || 0);
            });

            if (config.hasMonthly && monthlyCardDays > 0) {
                st.monthlySilver += 300;
                monthlyCardLumpGiven = true;
            }
        }

        processInstantRewards();

        // 检查目标是否已达成
        var currentSE = cSE + st.shopSilver + st.missionSilver + st.dailyTrialSilver + st.monthlySilver + st.weeklySilver +
            st.trainSilver + st.modeSilver + st.refreshSilver + st.eventSilver + (st.eventLumen *
                LUMEN_RATE) +
            st.codeSilver +
            st.bp28Silver + (st.bp28Lumen * LUMEN_RATE) + st.bp14Silver + (st.bp14Lumen * LUMEN_RATE) +
            st.preorderSilver + (st.preorderLumen * LUMEN_RATE) +
            st.preorderFreeSilver +
            (st.destinyLumen * LUMEN_RATE) +
            st.popupSilver + (st.popupLumen * LUMEN_RATE) +
            (st.shopPackLumen * LUMEN_RATE) +
            st.secretSilver + st.secretAdvSilver + (st.secretAdvLumen * LUMEN_RATE) +
            (st.lumenSupplyLumen * LUMEN_RATE);

        var currentPure = cPure + st.dailyTrialPure + st.weeklyPure + st.modePure + st.refreshPure +
            st.eventPure + st.codePure + st.journeyPure +
            st.bp28Pure + st.bp14Pure +
            st.destinyPure + st.popupPure + st.secretPure;

        if (currentSE >= tSE) { seDone = true;
            reachedSE = true;
            fDaySE = 0; }
        if (currentPure >= tPure) { pureDone = true;
            reachedPure = true;
            fDayPure = 0; }

        if (seDone && pureDone) {
            return { daySE: 0, dayPure: 0, stats: st, customs: customs };
        }

        // =============================================================
        // 阶段2: 按天模拟
        // =============================================================
        while (day <= maxDay && (!seDone || !pureDone)) {
            day++;

            if (config.hasShop && !seDone) st.shopSilver += 20;
            if (config.hasMission && !seDone) st.missionSilver += 20;

            if (config.hasDaily) {
                if (!seDone) st.dailyTrialSilver += 60;
                if (!pureDone) st.dailyTrialPure += 1;
                if (config.hasCourse && day <= config.maxCourseDays) {
                    if (!seDone) st.dailyTrialSilver += 120;
                    if (!pureDone) st.dailyTrialPure += 2;
                }
            }

            if (config.hasMonthly && day <= config.maxMonthlyDays) {
                if (!seDone) st.monthlySilver += 200;
            }

            if (config.hasWeekly && !config.weeklyInstant) {
                if (day % 7 === 0) {
                    if (!seDone) st.weeklySilver += 500;
                    if (!pureDone) st.weeklyPure += 10;
                }
            }

            if (config.trainSilverPerHit > 0 && config.trainCount > 0 && !config.trainInstant) {
                if (day % 14 === 0 && (day / 14) <= config.trainCount) {
                    if (!seDone) st.trainSilver += config.trainSilverPerHit;
                    st.trainCountActual++;
                }
            }

            if (day % 28 === 0) {
                var seasonIndex = day / 28;
                modeDefs.forEach(function(m) {
                    if (m.seasons > 0 && !m.instant && seasonIndex <= m.seasons) {
                        if (!seDone) st.modeSilver += m.silver;
                        if (!pureDone) st.modePure += m.pure;
                        st.modeCounts[m.id] = (st.modeCounts[m.id] || 0) + 1;
                    }
                });
            }

            if (config.hasRefresh && day % 30 === 0) {
                if (!seDone) st.refreshSilver += config.refreshLumenCount * LUMEN_RATE;
                if (!pureDone) st.refreshPure += config.refreshPureCount;
            }

            var eventStartDay = config.eventStartDay1 ? 1 : 0;

            if (config.eventCountTotal > 0 && !config.eventInstant) {
                var shouldSpawn = false;
                if (eventStartDay === 1) {
                    if (day === 1 || (day - 1) % config.eventPeriod === 0) {
                        shouldSpawn = true;
                    }
                } else {
                    if (day % config.eventPeriod === 0) {
                        shouldSpawn = true;
                    }
                }
                
                if (shouldSpawn && spawnedEvents < config.eventCountTotal) {
                    var toSpawn = Math.min(eventConcurrent, config.eventCountTotal - spawnedEvents);
                    for (var i = 0; i < toSpawn; i++) {
                        var claimDays = config.eventClaimDays > 0 ? config.eventClaimDays : 0;
                        var evt = {
                            elapsed: 0,
                            total: claimDays,
                            earnedSilver: 0,
                            earnedLumen: 0,
                            earnedPure: 0,
                            silverPerDay: claimDays > 0 ? config.eventSilverSingle / claimDays : 0,
                            lumenPerDay: claimDays > 0 ? 6 / claimDays : 0,
                            purePerDay: claimDays > 0 ? 6 / claimDays : 0,
                            isInstant: claimDays === 0
                        };
                        if (evt.isInstant) {
                            if (!seDone) {
                                st.eventSilver += config.eventSilverSingle;
                                st.eventLumen += 6;
                            }
                            if (!pureDone) st.eventPure += 6;
                            st.actualEvents++;
                            st.eventDetails.push({
                                index: st.actualEvents,
                                day: day,
                                claimDays: 0,
                                silver: config.eventSilverSingle,
                                lumen: 6,
                                pure: 6
                            });
                        } else {
                            st.actualEvents++;
                            pendingEvents.push(evt);
                            st.eventDetails.push({
                                index: st.actualEvents,
                                day: day,
                                claimDays: claimDays,
                                silver: 0,
                                lumen: 0,
                                pure: 0,
                                isPending: true
                            });
                        }
                    }
                    spawnedEvents += toSpawn;
                }
            }

            pendingEvents.forEach(function(ev, idx) {
                if (ev.elapsed < ev.total) {
                    ev.elapsed++;
                    var prevSilver = ev.earnedSilver;
                    var prevLumen = ev.earnedLumen;
                    var prevPure = ev.earnedPure;
                    
                    if (!seDone) {
                        ev.earnedSilver = Math.floor(ev.silverPerDay * ev.elapsed);
                        ev.earnedLumen = Math.floor(ev.lumenPerDay * ev.elapsed);
                        st.eventSilver += ev.earnedSilver - prevSilver;
                        st.eventLumen += ev.earnedLumen - prevLumen;
                    }
                    if (!pureDone) {
                        ev.earnedPure = Math.floor(ev.purePerDay * ev.elapsed);
                        st.eventPure += ev.earnedPure - prevPure;
                    }
                    
                    if (ev.elapsed === ev.total) {
                        var detail = st.eventDetails.find(function(d) { return d.isPending && d.index === (idx + 1); });
                        if (detail) {
                            detail.silver = ev.earnedSilver;
                            detail.lumen = ev.earnedLumen;
                            detail.pure = ev.earnedPure;
                            detail.isPending = false;
                        }
                    }
                }
            });

            customs.forEach(function(c) {
                if (c.delay > 0) {
                    var elapsed = c.originDelay - c.delay + 1;
                    if (!seDone) {
                        var totalSE = c.silver + c.lumen * LUMEN_RATE;
                        c.earnedSE = Math.floor(totalSE * elapsed / c.originDelay);
                    }
                    if (!pureDone) {
                        c.earnedPure = Math.floor(c.pure * elapsed / c.originDelay);
                    }
                    c.delay--;
                }
            });

            if (!config.bpInstant28 && bpNorm28 > 0 && day % 28 === 1) {
                var curIdx28 = Math.floor(day / 28) + 1;
                if (curIdx28 <= bpNorm28) {
                    bp28EarnedCount = curIdx28;
                    if (!pureDone) st.bp28Pure += 12;
                    if (curIdx28 <= bpAdv28 && !seDone) {
                        st.bp28Silver += 2500;
                        st.bp28Lumen += 12;
                    }
                    if (curIdx28 <= bpMax28 && !seDone && bpGift28) {
                        st.bp28Lumen += 5;
                    }
                    st.bp28ActualCount = bp28EarnedCount;
                    st.bp28ActualAdv = Math.min(bpAdv28, bp28EarnedCount);
                    st.bp28ActualMax = Math.min(bpMax28, bp28EarnedCount);
                }
            }

            if (!config.bpInstant14 && bpNorm14 > 0 && day % 14 === 1) {
                var curIdx14 = Math.floor(day / 14) + 1;
                if (curIdx14 <= bpNorm14) {
                    bp14EarnedCount = curIdx14;
                    if (!pureDone) st.bp14Pure += 12;
                    if (curIdx14 <= bpAdv14 && !seDone) {
                        st.bp14Silver += 2500;
                        st.bp14Lumen += 12;
                    }
                    if (curIdx14 <= bpMax14 && !seDone && bpGift14) {
                        st.bp14Lumen += 5;
                    }
                    st.bp14ActualCount = bp14EarnedCount;
                    st.bp14ActualAdv = Math.min(bpAdv14, bp14EarnedCount);
                    st.bp14ActualMax = Math.min(bpMax14, bp14EarnedCount);
                }
            }

            if (!destinyInstant) {
                if (config.destinyJoin && destinyJoinPeriods > 0) {
                    for (var p = 0; p < destinyJoinPeriods; p++) {
                        var start = p * destinyPeriod + 1;
                        if (day === start) {
                            if (!pureDone) st.destinyPure += 30;
                            st.destinyCyclesActual++;
                        }
                    }
                }
                if (destinyBuyCount > 0) {
                    var maxPeriods = Math.min(destinyBuyCount, destinyJoinPeriods || destinyBuyCount);
                    for (var p = 0; p < maxPeriods; p++) {
                        var start = p * destinyPeriod + 1;
                        if (day === start) {
                            if (!seDone) st.destinyLumen += 60;
                        }
                    }
                }
            }

            if (popupQueueCopy.length > 0 && !config.popupInstant) {
                if (day % 3 === 0 && day > 0) {
                    var tier = popupQueueCopy.shift();
                    if (tier) {
                        var cost = 0,
                            silver = 0,
                            lumen = 0,
                            pure = 0;
                        if (tier === '60') { cost = 60;
                            silver = 60;
                            lumen = 2;
                            pure = 1; }
                        if (tier === '120') { cost = 120;
                            silver = 120;
                            lumen = 4;
                            pure = 2; }
                        if (tier === '180') { cost = 180;
                            silver = 180;
                            lumen = 6;
                            pure = 3; }
                        if (!seDone) {
                            st.popupSilver += silver;
                            st.popupLumen += lumen;
                        }
                        if (!pureDone) st.popupPure += pure;
                        st.popupCost += cost;
                        st.popupUsedDetail.push(tier);
                    }
                }
            }

            if (packActive && packMonthsEarned < packMonthsMax && !config.shopPackInstant) {
                if (day % 30 === 0 && day > 0) {
                    if (!seDone) st.shopPackLumen += packLumenPerHit;
                    st.shopPackCost += packCostPerHit;
                    packMonthsEarned++;
                }
            }

            if (preorderQueue.length > 0) {
                var currentPreorder = preorderQueue[0];
                var startDay = 1 + currentPreorder.startOffset;
                if (!currentPreorder.triggeredIndex) currentPreorder.triggeredIndex = 0;
                while (currentPreorder.triggeredIndex < preorderSchedule.length) {
                    var item = preorderSchedule[currentPreorder.triggeredIndex];
                    var targetDay = startDay + item.offset;
                    if (day >= targetDay && day <= targetDay) {
                        if (!seDone) {
                            st.preorderSilver += item.silver;
                            st.preorderLumen += item.lumen;
                        }
                        currentPreorder.triggeredIndex++;
                    } else {
                        break;
                    }
                }
                if (currentPreorder.triggeredIndex === preorderSchedule.length) {
                    preorderQueue.shift();
                }
            }

            var currentSE2 = cSE + st.shopSilver + st.missionSilver + st.dailyTrialSilver + st.monthlySilver + st.weeklySilver +
                st.trainSilver + st.modeSilver + st.refreshSilver + st.eventSilver + (st.eventLumen *
                    LUMEN_RATE) +
                st.codeSilver +
                st.bp28Silver + (st.bp28Lumen * LUMEN_RATE) + st.bp14Silver + (st.bp14Lumen * LUMEN_RATE) +
                st.preorderSilver + (st.preorderLumen * LUMEN_RATE) +
                st.preorderFreeSilver +
                (st.destinyLumen * LUMEN_RATE) +
                st.popupSilver + (st.popupLumen * LUMEN_RATE) +
                (st.shopPackLumen * LUMEN_RATE) +
                st.secretSilver + st.secretAdvSilver + (st.secretAdvLumen * LUMEN_RATE) +
                (st.lumenSupplyLumen * LUMEN_RATE);

            var currentPure2 = cPure + st.dailyTrialPure + st.weeklyPure + st.modePure + st.refreshPure +
                st.eventPure + st.codePure + st.journeyPure +
                st.bp28Pure + st.bp14Pure +
                st.destinyPure + st.popupPure + st.secretPure;

            var customSE = 0,
                customPure = 0;
            customs.forEach(function(c) {
                customSE += c.earnedSE;
                customPure += c.earnedPure;
            });
            currentSE2 += customSE;
            currentPure2 += customPure;

            if (!seDone && currentSE2 >= tSE) {
                seDone = true;
                reachedSE = true;
                fDaySE = day;
            }
            if (!pureDone && currentPure2 >= tPure) {
                pureDone = true;
                reachedPure = true;
                fDayPure = day;
            }
        }

        if (!reachedSE) fDaySE = -1;
        if (!reachedPure) fDayPure = -1;

        if (!config.bpInstant28) {
            st.bp28ActualCount = bp28EarnedCount;
            st.bp28ActualAdv = Math.min(bpAdv28, bp28EarnedCount);
            st.bp28ActualMax = Math.min(bpMax28, bp28EarnedCount);
        }
        if (!config.bpInstant14) {
            st.bp14ActualCount = bp14EarnedCount;
            st.bp14ActualAdv = Math.min(bpAdv14, bp14EarnedCount);
            st.bp14ActualMax = Math.min(bpMax14, bp14EarnedCount);
        }

        st.shopPackUsedMonths = packMonthsEarned;

        return { daySE: fDaySE, dayPure: fDayPure, stats: st, customs: customs };
    }

    // ===== 计算入口 =====
    function calculate() {
        var tSilver = num("cpTargetSilver"),
            cSilver = num("cpCurrentSilver");
        var tLumen = num("cpTargetLumen"),
            cLumen = num("cpCurrentLumen");
        var tPure = num("cpTargetPure"),
            cPure = num("cpCurrentPure");

        var adjustSilver = numSigned("cpAdjustSilver");
        var adjustLumen = numSigned("cpAdjustLumen");
        var adjustPure = numSigned("cpAdjustPure");

        var targetSE = tSilver + tLumen * LUMEN_RATE;
        var currentSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE;
        var currentPureWithAdjust = cPure + adjustPure;

        var trainStops = parseInt($("cpTrainValue").value, 10) || 0;

        var preorderCooldown = parseFloat(document.getElementById("cpPreorderCooldownCustom").value);
        if (isNaN(preorderCooldown) || preorderCooldown < 0) preorderCooldown = 40;

        var config = {
            hasShop: checked("cpShop"),
            hasMission: checked("cpMissionSilver"),
            hasDaily: checked("cpDailyTrial"),
            hasCourse: checked("cpCourseBuy"),
            maxCourseDays: num("cpCourseDays"),
            hasMonthly: checked("cpMonthlyCard"),
            maxMonthlyDays: num("cpMonthlyCardDays"),
            hasWeekly: checked("cpWeeklyTrial"),
            weeklyInstant: checked("cpWeeklyInstant"),
            trainSilverPerHit: trainStops * 100,
            trainCount: num("cpTrainCount"),
            trainInstant: checked("cpTrainInstant"),
            mode1Seasons: num("cpMode1Seasons"),
            mode1Instant: checked("cpMode1Instant"),
            mode2Seasons: num("cpMode2Seasons"),
            mode2Instant: checked("cpMode2Instant"),
            mode3Seasons: num("cpMode3Seasons"),
            mode3Instant: checked("cpMode3Instant"),
            mode4Seasons: num("cpMode4Seasons"),
            mode4Instant: checked("cpMode4Instant"),
            hasRefresh: checked("cpMonthlyRefresh"),
            refreshLumenCount: num("cpRefreshLumenCount"),
            refreshPureCount: num("cpRefreshPureCount"),
            eventCountTotal: num("cpNormalEventCount"),
            eventInstant: checked("cpNormalEventInstant"),
            eventSilverSingle: num("cpNormalEventSilver"),
            eventPeriod: num("cpEventPeriod") || 28,
            eventStartDay1: checked("cpEventStartDay1"),
            eventClaimDays: num("cpEventClaimDays"),
            eventConcurrent: num("cpEventConcurrent") || 1,
            journeyPure: num("cpJourneyEventPure"),
            codeCount: num("cpCodeCount"),

            bpNormal28: num("cpBPNormal28"),
            bpAdvanced28: num("cpBPAdvanced28"),
            bpMaxed28: num("cpBPMaxed28"),
            bpInstant28: checked("cpBPInstant28"),
            bpGift28: checked("cpBPMaxed28Gift"),

            bpNormal14: num("cpBPNormal14"),
            bpAdvanced14: num("cpBPAdvanced14"),
            bpMaxed14: num("cpBPMaxed14"),
            bpInstant14: checked("cpBPInstant14"),
            bpGift14: checked("cpBPMaxed14Gift"),

            preorderCycles: num("cpPreorderCycles"),
            preorderBuyCount: num("cpPreorderBuyCount"),
            preorderCooldown: preorderCooldown,
            destinyJoin: checked("cpDestinyJoin"),
            destinyPeriod: $("cpDestinyPeriod").value,
            destinyJoinPeriods: num("cpDestinyJoinPeriods"),
            destinyBuyCount: num("cpDestinyBuyCount"),
            destinyInstant: checked("cpDestinyInstant"),
            popup60Count: num("cpPopup60Count"),
            popup120Count: num("cpPopup120Count"),
            popup180Count: num("cpPopup180Count"),
            popupInstant: checked("cpPopupInstant"),
            shopPack1: checked("cpShopPack1"),
            shopPack1Months: num("cpShopPack1Months"),
            shopPack2: checked("cpShopPack2"),
            shopPack2Months: num("cpShopPack2Months"),
            shopPack3: checked("cpShopPack3"),
            shopPack3Months: num("cpShopPack3Months"),
            shopPackInstant: checked("cpShopPackInstant"),
            secretCount: num("cpSecretCount"),
            secretAdvancedCount: num("cpSecretAdvancedCount"),
            lumenSupplyBuy: checked("cpLumenSupplyBuy"),

            customs: readCustomRows()
        };

        var res = simulateTarget(targetSE, currentSE, tPure, currentPureWithAdjust, config);

        var oneTimeCost =
            (config.preorderBuyCount > 0 ? config.preorderBuyCount * 1980 : 0) +
            (config.destinyBuyCount > 0 ? config.destinyBuyCount * 1680 : 0) +
            (config.lumenSupplyBuy ? 120 : 0) +
            (config.secretAdvancedCount * 980) +
            (config.bpAdvanced28 * 680) + (config.bpAdvanced14 * 680) +
            (config.bpMaxed28 * 600) + (config.bpMaxed14 * 300);

        if (config.hasCourse && config.maxCourseDays > 0) {
            oneTimeCost += 1280;
        }

        var totalCost = oneTimeCost + res.stats.popupCost + res.stats.shopPackCost + res.stats.customCost +
            res.stats.monthlyCardCost;

        var hasTargetSE = (tSilver > 0 || tLumen > 0);
        var hasTargetPure = (tPure > 0);

        var silverHTML;
        if (!hasTargetSE) {
            var totalSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
                res.stats.shopSilver + res.stats.missionSilver + res.stats.dailyTrialSilver + res.stats.monthlySilver +
                res.stats.weeklySilver + res.stats.trainSilver + res.stats.modeSilver +
                res.stats.refreshSilver + res.stats.eventSilver + (res.stats.eventLumen * LUMEN_RATE) +
                res.stats.codeSilver +
                res.stats.bp28Silver + (res.stats.bp28Lumen * LUMEN_RATE) +
                res.stats.bp14Silver + (res.stats.bp14Lumen * LUMEN_RATE) +
                res.stats.preorderSilver + (res.stats.preorderLumen * LUMEN_RATE) +
                res.stats.preorderFreeSilver +
                (res.stats.destinyLumen * LUMEN_RATE) +
                res.stats.popupSilver + (res.stats.popupLumen * LUMEN_RATE) +
                (res.stats.shopPackLumen * LUMEN_RATE) +
                res.stats.secretSilver + res.stats.secretAdvSilver + (res.stats.secretAdvLumen * LUMEN_RATE) +
                (res.stats.lumenSupplyLumen * LUMEN_RATE);
            var customTotalSE = 0;
            res.customs.forEach(function(c) { customTotalSE += c.earnedSE; });
            totalSE += customTotalSE;

            var totalLumenEq = Math.floor(totalSE / LUMEN_RATE);
            silverHTML = "银芯/流明之芯（未设目标）：合计拥有预测 <b>" + fmt(totalSE) + "</b> 银芯数量（约 <b>" + totalLumenEq +
                "</b> 流明之芯）";
        } else if (res.daySE === 0) {
            var totalSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
                res.stats.shopSilver + res.stats.missionSilver + res.stats.dailyTrialSilver + res.stats.monthlySilver +
                res.stats.weeklySilver + res.stats.trainSilver + res.stats.modeSilver +
                res.stats.refreshSilver + res.stats.eventSilver + (res.stats.eventLumen * LUMEN_RATE) +
                res.stats.codeSilver +
                res.stats.bp28Silver + (res.stats.bp28Lumen * LUMEN_RATE) +
                res.stats.bp14Silver + (res.stats.bp14Lumen * LUMEN_RATE) +
                res.stats.preorderSilver + (res.stats.preorderLumen * LUMEN_RATE) +
                res.stats.preorderFreeSilver +
                (res.stats.destinyLumen * LUMEN_RATE) +
                res.stats.popupSilver + (res.stats.popupLumen * LUMEN_RATE) +
                (res.stats.shopPackLumen * LUMEN_RATE) +
                res.stats.secretSilver + res.stats.secretAdvSilver + (res.stats.secretAdvLumen * LUMEN_RATE) +
                (res.stats.lumenSupplyLumen * LUMEN_RATE);
            var customTotalSE = 0;
            res.customs.forEach(function(c) { customTotalSE += c.earnedSE; });
            totalSE += customTotalSE;
            silverHTML = "银芯与流明之芯：<b>已有足够数量</b>！合计拥有预测：<b>" + fmt(totalSE) + "</b> 银芯数量";
        } else if (res.daySE === -1) {
            var totalSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
                res.stats.shopSilver + res.stats.missionSilver + res.stats.dailyTrialSilver + res.stats.monthlySilver +
                res.stats.weeklySilver + res.stats.trainSilver + res.stats.modeSilver +
                res.stats.refreshSilver + res.stats.eventSilver + (res.stats.eventLumen * LUMEN_RATE) +
                res.stats.codeSilver +
                res.stats.bp28Silver + (res.stats.bp28Lumen * LUMEN_RATE) +
                res.stats.bp14Silver + (res.stats.bp14Lumen * LUMEN_RATE) +
                res.stats.preorderSilver + (res.stats.preorderLumen * LUMEN_RATE) +
                res.stats.preorderFreeSilver +
                (res.stats.destinyLumen * LUMEN_RATE) +
                res.stats.popupSilver + (res.stats.popupLumen * LUMEN_RATE) +
                (res.stats.shopPackLumen * LUMEN_RATE) +
                res.stats.secretSilver + res.stats.secretAdvSilver + (res.stats.secretAdvLumen * LUMEN_RATE) +
                (res.stats.lumenSupplyLumen * LUMEN_RATE);
            var customTotalSE = 0;
            res.customs.forEach(function(c) { customTotalSE += c.earnedSE; });
            totalSE += customTotalSE;
            silverHTML = "银芯与流明之芯：按目前勾选的来源，或许要去抢劫德克斯特勋爵才能在 " + MAX_DAY + " 天（约10年）内达成目标。，请检查是否遗漏了产出来源，或适当调低目标。（合计拥有预测：<b>" + fmt(totalSE) +
                "</b> 银芯数量）";
        } else {
            var totalSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
                res.stats.shopSilver + res.stats.missionSilver + res.stats.dailyTrialSilver + res.stats.monthlySilver +
                res.stats.weeklySilver + res.stats.trainSilver + res.stats.modeSilver +
                res.stats.refreshSilver + res.stats.eventSilver + (res.stats.eventLumen * LUMEN_RATE) +
                res.stats.codeSilver +
                res.stats.bp28Silver + (res.stats.bp28Lumen * LUMEN_RATE) +
                res.stats.bp14Silver + (res.stats.bp14Lumen * LUMEN_RATE) +
                res.stats.preorderSilver + (res.stats.preorderLumen * LUMEN_RATE) +
                res.stats.preorderFreeSilver +
                (res.stats.destinyLumen * LUMEN_RATE) +
                res.stats.popupSilver + (res.stats.popupLumen * LUMEN_RATE) +
                (res.stats.shopPackLumen * LUMEN_RATE) +
                res.stats.secretSilver + res.stats.secretAdvSilver + (res.stats.secretAdvLumen * LUMEN_RATE) +
                (res.stats.lumenSupplyLumen * LUMEN_RATE);
            var customTotalSE = 0;
            res.customs.forEach(function(c) { customTotalSE += c.earnedSE; });
            totalSE += customTotalSE;
            silverHTML = "达成银芯/流明之芯目标还需 <b>" + res.daySE + "</b> 天（合计拥有预测 <b>" + fmt(totalSE) +
                "</b> 银芯数量）";
        }

        var pureHTML;
        if (!hasTargetPure) {
            var totalPure = cPure + adjustPure + res.stats.dailyTrialPure + res.stats.weeklyPure +
                res.stats.modePure + res.stats.refreshPure + res.stats.eventPure + res.stats.codePure +
                res.stats.journeyPure + res.stats.bp28Pure + res.stats.bp14Pure + res.stats.destinyPure +
                res.stats.popupPure + res.stats.secretPure;
            var customTotalPure = 0;
            res.customs.forEach(function(c) { customTotalPure += c.earnedPure; });
            totalPure += customTotalPure;
            pureHTML = "无垢之芯（未设目标）：合计拥有预测 <b>" + fmt(totalPure) + "</b> 个";
        } else if (res.dayPure === 0) {
            var totalPure = cPure + adjustPure + res.stats.dailyTrialPure + res.stats.weeklyPure +
                res.stats.modePure + res.stats.refreshPure + res.stats.eventPure + res.stats.codePure +
                res.stats.journeyPure + res.stats.bp28Pure + res.stats.bp14Pure + res.stats.destinyPure +
                res.stats.popupPure + res.stats.secretPure;
            var customTotalPure = 0;
            res.customs.forEach(function(c) { customTotalPure += c.earnedPure; });
            totalPure += customTotalPure;
            pureHTML = "无垢之芯：<b>已有足够数量</b>！合计拥有预测：<b>" + fmt(totalPure) + "</b> 个";
        } else if (res.dayPure === -1) {
            var totalPure = cPure + adjustPure + res.stats.dailyTrialPure + res.stats.weeklyPure +
                res.stats.modePure + res.stats.refreshPure + res.stats.eventPure + res.stats.codePure +
                res.stats.journeyPure + res.stats.bp28Pure + res.stats.bp14Pure + res.stats.destinyPure +
                res.stats.popupPure + res.stats.secretPure;
            var customTotalPure = 0;
            res.customs.forEach(function(c) { customTotalPure += c.earnedPure; });
            totalPure += customTotalPure;
            pureHTML = "无垢之芯：按目前勾选的来源，或许要去抢劫德克斯特勋爵才能在 " + MAX_DAY + " 天（约10年）内达成目标，请检查是否遗漏了产出来源，或适当调低目标。（合计拥有预测 <b>" +
                fmt(totalPure) + "</b> 个）";
        } else {
            var totalPure = cPure + adjustPure + res.stats.dailyTrialPure + res.stats.weeklyPure +
                res.stats.modePure + res.stats.refreshPure + res.stats.eventPure + res.stats.codePure +
                res.stats.journeyPure + res.stats.bp28Pure + res.stats.bp14Pure + res.stats.destinyPure +
                res.stats.popupPure + res.stats.secretPure;
            var customTotalPure = 0;
            res.customs.forEach(function(c) { customTotalPure += c.earnedPure; });
            totalPure += customTotalPure;
            pureHTML = "无垢之芯目标还需 <b>" + res.dayPure + "</b> 天（合计拥有预测 <b>" + fmt(totalPure) + "</b> 个）";
        }
        
        var st = res.stats;

        var finalSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
            st.shopSilver + st.missionSilver + st.dailyTrialSilver + st.monthlySilver + st.weeklySilver + st.trainSilver +
            st.modeSilver + st.refreshSilver + st.eventSilver + (st.eventLumen * LUMEN_RATE) +
            st.codeSilver +
            st.bp28Silver + (st.bp28Lumen * LUMEN_RATE) + st.bp14Silver + (st.bp14Lumen * LUMEN_RATE) +
            st.preorderSilver + (st.preorderLumen * LUMEN_RATE) +
            st.preorderFreeSilver +
            (st.destinyLumen * LUMEN_RATE) +
            st.popupSilver + (st.popupLumen * LUMEN_RATE) +
            (st.shopPackLumen * LUMEN_RATE) +
            st.secretSilver + st.secretAdvSilver + (st.secretAdvLumen * LUMEN_RATE) +
            (st.lumenSupplyLumen * LUMEN_RATE);
        var finalPure = cPure + adjustPure + st.dailyTrialPure + st.weeklyPure + st.modePure + st.refreshPure +
            st.eventPure + st.codePure + st.journeyPure +
            st.bp28Pure + st.bp14Pure +
            st.destinyPure + st.popupPure + st.secretPure;

        var remainSE = finalSE - targetSE;
        var remainPure = finalPure - tPure;
        var remainLumen = Math.floor(remainSE / LUMEN_RATE);

        var totalLumenEquivalent = Math.floor(finalSE / LUMEN_RATE);
        var pityAwaken = Math.floor(totalLumenEquivalent / 90);
        var pityWheel = Math.floor(totalLumenEquivalent / 60);

        var tableHTML =
            "<table class='cp-breakdown-table'><thead><tr><th>收益来源渠道</th><th>提供银芯(含流明折算)</th><th>提供无垢之芯</th></tr></thead><tbody>";
        tableHTML += "<tr><td>当前已有数量 (初始计入)</td><td>" + fmt(cSilver + cLumen * LUMEN_RATE) + "</td><td>" +
            fmt(cPure) + "</td></tr>";
        if (adjustSilver !== 0 || adjustLumen !== 0 || adjustPure !== 0) {
            tableHTML += "<tr><td>自定义修正值</td><td>" + fmt(adjustSilver + adjustLumen * LUMEN_RATE) +
                "</td><td>" + fmt(adjustPure) + "</td></tr>";
        }

        if (st.shopSilver > 0) tableHTML +=
            "<tr><td>每日·商店每日常规补助</td><td>" + fmt(st.shopSilver) + "</td><td>0</td></tr>";

        if (st.missionSilver > 0) tableHTML +=
            "<tr><td>每日·派遣</td><td>" + fmt(st.missionSilver) + "</td><td>0</td></tr>";

        if (st.dailyTrialSilver > 0 || st.dailyTrialPure > 0) {
            var activatedCourseDays = Math.min(res.daySE > 0 ? res.daySE : 0, config.maxCourseDays);
            var courseTip = (config.hasCourse && config.hasDaily) ? "(含核心课题 " + activatedCourseDays + " 天加成)" :
                "";
            tableHTML += "<tr><td>每日·日常试训 " + courseTip + "</td><td>" + fmt(st.dailyTrialSilver) +
                "</td><td>" + fmt(st.dailyTrialPure) + "</td></tr>";
        }

        if (st.monthlySilver > 0) {
            var monthlyDays = Math.min(res.daySE > 0 ? res.daySE : 0, config.maxMonthlyDays);
            var monthlyCostStr = st.monthlyCardCost > 0 ? " (花费 " + fmt(st.monthlyCardCost) + " 源液)" : "";
            tableHTML += "<tr><td>每日·月卡（购买）" + monthlyCostStr + " (有效 " + monthlyDays + " 天)</td><td>" + fmt(st
                .monthlySilver) + "</td><td>0</td></tr>";
        }
        if (st.weeklySilver > 0 || st.weeklyPure > 0) {
            var weeklyLabel = config.weeklyInstant ? "(只计算一次)" : "(每周重置)";
            tableHTML += "<tr><td>每周·周常试训奖励 " + weeklyLabel + "</td><td>" + fmt(st.weeklySilver) +
                "</td><td>" + fmt(st.weeklyPure) + "</td></tr>";
        }
        if (st.trainSilver > 0) {
            var trainLabel = config.trainInstant ? "(立即计入所有次数)" : "(每14天重置，历经 " + st.trainCountActual + " 次)";
            tableHTML += "<tr><td>14天·融灾禁区特训档位奖励 " + trainLabel + "</td><td>" + fmt(st.trainSilver) +
                "</td><td>0</td></tr>";
        }
        if (st.modeSilver > 0 || st.modePure > 0) {
            var modeParts = [];
            if (config.mode1Seasons > 0) modeParts.push("幻梦深潜×" + st.modeCounts.mode1);
            if (config.mode2Seasons > 0) modeParts.push("欢愉专列×" + st.modeCounts.mode2);
            if (config.mode3Seasons > 0) modeParts.push("预组×" + st.modeCounts.mode3);
            if (config.mode4Seasons > 0) modeParts.push("轮选×" + st.modeCounts.mode4);
            var modeLabel = modeParts.length ? " (实际历经 " + modeParts.join(", ") + ")" : "";
            tableHTML += "<tr><td>28天·轮换玩法产出 " + modeLabel + "</td><td>" + fmt(st.modeSilver) +
                "</td><td>" + fmt(st.modePure) + "</td></tr>";
        }
        if (st.refreshSilver > 0 || st.refreshPure > 0) {
            var refreshLabel = "每月1日·商城沉淀兑换 (流明之芯×" + config.refreshLumenCount + " / 无垢之芯×" + config
                .refreshPureCount + ")";
            tableHTML += "<tr><td>" + refreshLabel + "</td><td>" + fmt(st.refreshSilver) + "</td><td>" + fmt(
                st.refreshPure) + "</td></tr>";
        }

        if (config.eventCountTotal > 0) {
            var eventDetailStr = "";
            var totalEventSilver = st.eventSilver + st.eventLumen * LUMEN_RATE;
            var totalEventPure = st.eventPure;
            
            var claimDayGroups = {};
            st.eventDetails.forEach(function(d) {
                var key = d.claimDays + "天拿满";
                if (!claimDayGroups[key]) claimDayGroups[key] = 0;
                claimDayGroups[key]++;
            });
            var groupStr = [];
            for (var k in claimDayGroups) {
                groupStr.push(claimDayGroups[k] + "个(" + k + ")");
            }
            
            tableHTML += "<tr><td>预期活动·常规活动 (实际历经 <b>" + st.actualEvents + "</b> 个" + 
                (config.eventConcurrent > 1 ? "，每次重叠" + config.eventConcurrent + "个" : "") +
                (groupStr.length > 0 ? "，" + groupStr.join("、") : "") + 
                ")</td><td>" + fmt(totalEventSilver) + "</td><td>" + fmt(totalEventPure) + "</td></tr>";
        }

        if (st.codeSilver > 0 || st.codePure > 0) tableHTML += "<tr><td>兑换码收益</td><td>" + fmt(st.codeSilver) +
            "</td><td>" + fmt(st.codePure) + "</td></tr>";
        if (st.journeyPure > 0) tableHTML += "<tr><td>纪行无垢之芯总量</td><td>0</td><td>" + fmt(st.journeyPure) +
            "</td></tr>";

        if (st.bp28Silver > 0 || st.bp28Lumen > 0 || st.bp28Pure > 0) {
            var bpDesc28 = config.bpInstant28 ? "课题纪录 28天/期 (立即计入)" : "课题纪录 28天/期 (实际经历 " + st
                .bp28ActualCount + " 期";
            if (!config.bpInstant28) {
                bpDesc28 += "，含高级 " + st.bp28ActualAdv + " 期，核心 " + st.bp28ActualMax + " 期)";
            }
            var totalBPSE28 = st.bp28Silver + (st.bp28Lumen * LUMEN_RATE);
            tableHTML += "<tr><td>" + bpDesc28 + "</td><td>" + fmt(totalBPSE28) + "</td><td>" + fmt(st.bp28Pure) +
                "</td></tr>";
        }
        if (st.bp14Silver > 0 || st.bp14Lumen > 0 || st.bp14Pure > 0) {
            var bpDesc14 = config.bpInstant14 ? "课题纪录 14天/期 (立即计入)" : "课题纪录 14天/期 (实际经历 " + st
                .bp14ActualCount + " 期";
            if (!config.bpInstant14) {
                bpDesc14 += "，含高级 " + st.bp14ActualAdv + " 期，核心 " + st.bp14ActualMax + " 期)";
            }
            var totalBPSE14 = st.bp14Silver + (st.bp14Lumen * LUMEN_RATE);
            tableHTML += "<tr><td>" + bpDesc14 + "</td><td>" + fmt(totalBPSE14) + "</td><td>" + fmt(st.bp14Pure) +
                "</td></tr>";
        }

        if (st.preorderFreeSilver > 0) {
            tableHTML += "<tr><td>预购纪行·免费附赠 (历经 " + st.preorderCyclesActual + " 个周期)</td><td>" + fmt(st
                .preorderFreeSilver) + "</td><td>0</td></tr>";
        }
        if (st.preorderSilver > 0 || st.preorderLumen > 0) {
            tableHTML += "<tr><td>氪金·预购纪行 " + (config.preorderBuyCount > 0 ? "(购买 " + config.preorderBuyCount +
                " 次，每次跨度 " + config.preorderCooldown + " 天)" : "") + "</td><td>" + fmt(st.preorderSilver + st.preorderLumen *
                LUMEN_RATE) + "</td><td>0</td></tr>";
        }
        if (st.destinyLumen > 0 || st.destinyPure > 0) {
            var destinyLabel = "";
            if (config.destinyInstant) destinyLabel = "(立即结算)";
            else if (config.destinyJoin && config.destinyBuyCount > 0) destinyLabel = "(免费任务 " + st
                .destinyCyclesActual + " 周期 + 购买 " + config.destinyBuyCount + " 次)";
            else if (config.destinyJoin) destinyLabel = "(免费任务 " + st.destinyCyclesActual + " 周期)";
            else if (config.destinyBuyCount > 0) destinyLabel = "(购买 " + config.destinyBuyCount + " 次)";
            tableHTML += "<tr><td>氪金·命轮纪行 " + destinyLabel + "</td><td>" + fmt(st.destinyLumen * LUMEN_RATE) +
                "</td><td>" + fmt(st.destinyPure) + "</td></tr>";
        }
        if (st.popupSilver > 0 || st.popupLumen > 0 || st.popupPure > 0) {
            var popupDetail = [];
            var count60 = st.popupUsedDetail.filter(function(t) { return t === '60'; }).length;
            var count120 = st.popupUsedDetail.filter(function(t) { return t === '120'; }).length;
            var count180 = st.popupUsedDetail.filter(function(t) { return t === '180'; }).length;
            if (count60 > 0) popupDetail.push("60档×" + count60);
            if (count120 > 0) popupDetail.push("120档×" + count120);
            if (count180 > 0) popupDetail.push("180档×" + count180);
            var popupLabel = popupDetail.length ? " (顺序购买 " + popupDetail.join(", ") + ")" : "";
            tableHTML += "<tr><td>氪金·三天弹窗" + popupLabel + "</td><td>" + fmt(st.popupSilver + st
                .popupLumen * LUMEN_RATE) + "</td><td>" + fmt(st.popupPure) + "</td></tr>";
        }
        if (st.shopPackLumen > 0) {
            var packDetail = [];
            if (config.shopPack1Months > 0) packDetail.push("Ⅰ档×" + config.shopPack1Months + "月");
            if (config.shopPack2Months > 0) packDetail.push("Ⅱ档×" + config.shopPack2Months + "月");
            if (config.shopPack3Months > 0) packDetail.push("Ⅲ档×" + config.shopPack3Months + "月");
            var packLabel = packDetail.length ? " (" + packDetail.join(", ") + ")" : "";
            tableHTML += "<tr><td>氪金·商店常规礼包" + packLabel + "</td><td>" + fmt(st.shopPackLumen * LUMEN_RATE) +
                "</td><td>0</td></tr>";
        }
        if (st.secretSilver > 0 || st.secretPure > 0) {
            tableHTML += "<tr><td>守密纪行·免费解锁（" + st.secretActualCount + " 个）</td><td>" + fmt(st.secretSilver) +
                "</td><td>" + fmt(st.secretPure) + "</td></tr>";
        }
        if (st.secretAdvSilver > 0 || st.secretAdvLumen > 0) {
            tableHTML += "<tr><td>守密纪行·进阶购买（" + st.secretAdvActualCount + " 个，980源液/个）</td><td>" + fmt(st.secretAdvSilver + st.secretAdvLumen * LUMEN_RATE) +
                "</td><td>0</td></tr>";
        }
        
        if (st.lumenSupplyLumen > 0) {
            tableHTML += "<tr><td>氪金·流明唤醒补给</td><td>" + fmt(st.lumenSupplyLumen * LUMEN_RATE) +
                "</td><td>0</td></tr>";
        }

        var totalCustomSE = 0,
            totalCustomPure = 0;
        res.customs.forEach(function(c) {
            if (c.earnedSE > 0 || c.earnedPure > 0 || c.cost > 0) {
                var costStr = c.cost > 0 ? " (花费" + fmt(c.cost) + "源液)" : "";
                tableHTML += "<tr><td>自定义·" + c.name + costStr + "</td><td>" + fmt(c.earnedSE) + "</td><td>" +
                    fmt(c.earnedPure) + "</td></tr>";
                totalCustomSE += c.earnedSE;
                totalCustomPure += c.earnedPure;
            }
        });

        var totalBPSETotal = st.bp28Silver + (st.bp28Lumen * LUMEN_RATE) + st.bp14Silver + (st.bp14Lumen *
            LUMEN_RATE);
        var totalBPPureTotal = st.bp28Pure + st.bp14Pure;

        var totalPaidSE = st.preorderSilver + (st.preorderLumen * LUMEN_RATE) + (st.destinyLumen * LUMEN_RATE) +
            st.popupSilver + (st.popupLumen * LUMEN_RATE) + (st.shopPackLumen * LUMEN_RATE) +
            st.secretSilver + st.secretAdvSilver + (st.secretAdvLumen * LUMEN_RATE) +
            (st.lumenSupplyLumen * LUMEN_RATE);
        var totalPaidPure = st.destinyPure + st.popupPure + st.secretPure;

        var totalEarnedSE = cSilver + cLumen * LUMEN_RATE + adjustSilver + adjustLumen * LUMEN_RATE +
            st.shopSilver + st.missionSilver + st.dailyTrialSilver + st.monthlySilver + st.weeklySilver + st.trainSilver +
            st.modeSilver + st.refreshSilver + st.eventSilver + (st.eventLumen * LUMEN_RATE) +
            totalCustomSE + st.codeSilver + totalBPSETotal + totalPaidSE +
            st.preorderFreeSilver;
        var totalEarnedPure = cPure + adjustPure + st.dailyTrialPure + st.weeklyPure + st.modePure +
            st.refreshPure + st.eventPure + totalCustomPure + st.codePure + st.journeyPure +
            totalBPPureTotal + totalPaidPure;

        tableHTML += "<tr class='cp-total'><td>合计拥有预测</td><td>" + fmt(totalEarnedSE) + (hasTargetSE ?
            " (目标 " + targetSE + ")" : "") + "</td><td>" + fmt(totalEarnedPure) + (hasTargetPure ?
            " (目标 " + tPure + ")" : "") + "</td></tr>";

        if (hasTargetSE && hasTargetPure) {
            var remainSEStr = remainSE >= 0 ? fmt(remainSE) : "不足";
            var remainPureStr = remainPure >= 0 ? fmt(remainPure) : "不足";
            var remainLumenStr = remainLumen >= 0 ? fmt(remainLumen) : "不足";
            tableHTML += "<tr><td>达成目标后剩余资源（银芯数量 / 无垢之芯）</td><td>" + remainSEStr + " (≈" + remainLumenStr +
                "流明)</td><td>" + remainPureStr + "</td></tr>";
        }

        var lumenEquivalent = Math.floor(totalEarnedSE / LUMEN_RATE);
        tableHTML += "<tr><td>银芯换算流明之芯（每200银芯=1流明之芯）</td><td colspan='2'>合计银芯数量 " + fmt(totalEarnedSE) +
            " ≈ 折算流明之芯 " + lumenEquivalent + " 个</td></tr>";

        if (totalCost > 0) {
            tableHTML += "<tr class='cp-cost'><td>预计花费源液（氪金部分合计）</td><td colspan='2'>" + fmt(totalCost) +
                "</td></tr>";
        }

        tableHTML += "<tr><td colspan='3' style='padding:8px 6px; border-top:1px solid var(--a);'>" +
          "<span style='color:var(--a); font-weight:bold;'>活动唤醒大保底预估</span>（基于总流明之芯数量 " + lumenEquivalent + "）" +
          "</td></tr>";
        tableHTML += "<tr><td colspan='3' style='padding:2px 6px 2px 20px;'>• 唤醒体（90/次）：可保底 <b>" + pityAwaken + "</b> 次</td></tr>";
        tableHTML += "<tr><td colspan='3' style='padding:2px 6px 2px 20px;'>• 命轮（60/次）：可保底 <b>" + pityWheel + "</b> 次</td></tr>";
        tableHTML += "<tr><td colspan='3' style='padding:2px 6px 2px 20px;'>• 组合（1唤醒体+1命轮，共150流明之芯）：可保底 <b>" + Math.min(pityAwaken, pityWheel) + "</b> 组</td></tr>";

        tableHTML += "</tbody></table>";

        var storageKey = 'cp_table_collapsed';
        var storedCollapsed = localStorage.getItem(storageKey);
        var isCollapsed = (storedCollapsed === 'true');

        var toggleBtnHTML =
            "<button class='cp-table-toggle' id='cpTableToggle'>" + (isCollapsed ? "展开明细" : "收起明细") +
            "</button>";
        var containerClass = "cp-table-container" + (isCollapsed ? " collapsed" : "");

        var resultHTML =
            "<div class='cp-result'>" +
            "<h3>计算结果</h3>" +
            "<div class='cp-result-headline'>" + silverHTML + "</div>" +
            "<div class='cp-result-headline'>" + pureHTML + "</div>" +
            toggleBtnHTML +
            "<div class='" + containerClass + "' id='cpTableContainer'>" + tableHTML + "</div>" +
            "<div class='cp-note'>※ 明细中的数值根据达成天数动态截取，未达成的活动不计。<br>一次性付费项目按填写总量一次性计算。<br>优先计算氪金内容。</div>" +
            "<div class='cp-result-btn-row'>" +
            "<button class='cp-calc-btn' id='cpCalcBtnBottom'>开始计算</button>" +
            "<button class='cp-reset-btn' id='cpResetBtnBottom'>全部重置</button>" +
            "</div>" +
            "</div>";

        $("cpResult").innerHTML = resultHTML;

        var toggle = document.getElementById("cpTableToggle");
        var container = document.getElementById("cpTableContainer");
        if (toggle && container) {
            toggle.addEventListener("click", function() {
                var currentlyCollapsed = container.classList.contains("collapsed");
                if (currentlyCollapsed) {
                    container.classList.remove("collapsed");
                    toggle.textContent = "收起明细";
                    localStorage.setItem(storageKey, 'false');
                } else {
                    container.classList.add("collapsed");
                    toggle.textContent = "展开明细";
                    localStorage.setItem(storageKey, 'true');
                }
            });
        }

        document.getElementById("cpCalcBtnBottom").addEventListener("click", calculate);
        document.getElementById("cpResetBtnBottom").addEventListener("click", function() {
            if (confirm("确定要重置全部内容为初始状态吗？")) {
                resetAll();
            }
        });
    }

    // ===== 重置 =====
    function resetAll() {
        ["cpTargetSilver", "cpCurrentSilver", "cpTargetLumen", "cpCurrentLumen", "cpTargetPure",
            "cpCurrentPure"
        ].forEach(function(id) { $(id).value = 0; });
        ["cpAdjustSilver", "cpAdjustLumen", "cpAdjustPure"].forEach(function(id) { $(id).value = 0; });

        $("cpShop").checked = true;
        $("cpMissionSilver").checked = true;
        $("cpDailyTrial").checked = true;
        $("cpCourseBuy").checked = false;
        $("cpCourseDays").value = 28;
        $("cpMonthlyCard").checked = false;
        $("cpMonthlyCardDays").value = 30;
        toggleCourseVisibility();
        updateMonthlyCost();
        updateCourseCost();

        $("cpWeeklyTrial").checked = true;
        $("cpWeeklyInstant").checked = false;

        $("cpTrainValue").value = "10";
        $("cpTrainCount").value = 0;
        $("cpTrainInstant").checked = false;

        ["cpMode1Seasons", "cpMode2Seasons", "cpMode3Seasons", "cpMode4Seasons"].forEach(function(id) { $(id)
                .value = 0; });
        ["cpMode1Instant", "cpMode2Instant", "cpMode3Instant", "cpMode4Instant"].forEach(function(id) { $(id)
                .checked = false; });

        $("cpNormalEventCount").value = 0;
        $("cpNormalEventInstant").checked = false;
        $("cpNormalEventSilver").value = 900;
        $("cpEventPeriod").value = 28;
        $("cpEventClaimDays").value = 0;
        $("cpEventConcurrent").value = 1;
        $("cpJourneyEventPure").value = 0;
        $("cpCodeCount").value = 0;

        $("cpBPNormal28").value = 0;
        $("cpBPAdvanced28").value = 0;
        $("cpBPMaxed28").value = 0;
        $("cpBPInstant28").checked = false;
        $("cpBPMaxed28Gift").checked = false;

        $("cpBPNormal14").value = 0;
        $("cpBPAdvanced14").value = 0;
        $("cpBPMaxed14").value = 0;
        $("cpBPInstant14").checked = false;
        $("cpBPMaxed14Gift").checked = false;

        $("cpMonthlyRefresh").checked = false;
        $("cpRefreshLumenCount").value = 5;
        $("cpRefreshPureCount").value = 5;

        $("cpPreorderCycles").value = 0;
        $("cpPreorderBuyCount").value = 0;
        document.getElementById("cpPreorderCooldownCustom").value = 40;
        $("cpDestinyJoin").checked = false;
        $("cpDestinyPeriod").value = "28";
        $("cpDestinyJoinPeriods").value = 0;
        $("cpDestinyBuyCount").value = 0;
        $("cpDestinyInstant").checked = false;
        $("cpPopup60Count").value = 0;
        $("cpPopup120Count").value = 0;
        $("cpPopup180Count").value = 0;
        $("cpPopupInstant").checked = false;
        $("cpShopPack1").checked = false;
        $("cpShopPack1Months").value = 0;
        $("cpShopPack2").checked = false;
        $("cpShopPack2Months").value = 0;
        $("cpShopPack3").checked = false;
        $("cpShopPack3Months").value = 0;
        $("cpShopPackInstant").checked = false;
        $("cpSecretCount").value = 0;
        $("cpSecretAdvancedCount").value = 0;
        $("cpLumenSupplyBuy").checked = false;

        $("cpCustomContainer").innerHTML = "";

        updatePreorderCooldown();

        $("cpResult").innerHTML =
            "<div class='cp-result' style='border-color:var(--bg-inner);'>" +
            "<h3>计算结果</h3>" +
            "<div style='opacity:0.6; font-size:13px;'>点击下方按钮进行计算</div>" +
            "<div class='cp-result-btn-row'>" +
            "<button class='cp-calc-btn' id='cpCalcBtnTop'>开始计算</button>" +
            "<button class='cp-reset-btn' id='cpResetBtnTop'>全部重置</button>" +
            "</div>" +
            "</div>";

        document.getElementById("cpCalcBtnTop").addEventListener("click", calculate);
        document.getElementById("cpResetBtnTop").addEventListener("click", function() {
            if (confirm("确定要重置全部内容为初始状态吗？")) {
                resetAll();
            }
        });

        toggleRefreshVisibility();
        clampBP();
    }

    // ===== 绑定事件 =====
    document.getElementById("cpCalcBtnTop").addEventListener("click", calculate);
    document.getElementById("cpResetBtnTop").addEventListener("click", function() {
        if (confirm("确定要重置全部内容为初始状态吗？")) {
            resetAll();
        }
    });

    window.addEventListener("DOMContentLoaded", function() {
        clampBP();
        updateMonthlyCost();
        updateCourseCost();
        updatePreorderCooldown();
        document.getElementById("cpCalcBtnTop").addEventListener("click", calculate);
        document.getElementById("cpResetBtnTop").addEventListener("click", function() {
            if (confirm("确定要重置全部内容为初始状态吗？")) {
                resetAll();
            }
        });
    });

})();