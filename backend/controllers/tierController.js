const db = require('../db/connection');

// =====================================================
// EMERGENCY RESPONSE TIER CONTROLLER
// =====================================================

// Get all tier definitions
exports.getTierDefinitions = async (req, res) => {
  try {
    const [tiers] = await db.query('SELECT * FROM ResponseTierDefinitions ORDER BY TierLevel');
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching tier definitions:', error);
    res.status(500).json({ message: 'Error fetching tier definitions', error: error.message });
  }
};

// Auto-evaluate tier for disaster
exports.evaluateDisasterTier = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const [disasters] = await db.query('SELECT * FROM Disasters WHERE DisasterID = ?', [disasterId]);
    
    if (disasters.length === 0) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    const disaster = disasters[0];
    const recommendedTier = await calculateRecommendedTier(disaster);
    const currentTier = disaster.ResponseTier || 'Tier 1 - Local';

    // Check if escalation needed
    const escalationNeeded = shouldEscalate(currentTier, recommendedTier.tier);

    res.json({
      currentTier,
      recommendedTier: recommendedTier.tier,
      criteria: recommendedTier.criteria,
      escalationNeeded,
      reasoning: recommendedTier.reasoning
    });
  } catch (error) {
    console.error('Error evaluating tier:', error);
    res.status(500).json({ message: 'Error evaluating tier', error: error.message });
  }
};

// Escalate disaster tier
exports.escalateTier = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const { toTier, reason, escalatedBy, autoEscalation } = req.body;

    // Get current tier
    const [disasters] = await db.query(
      'SELECT ResponseTier, EscalationHistory FROM Disasters WHERE DisasterID = ?',
      [disasterId]
    );

    if (disasters.length === 0) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    const fromTier = disasters[0].ResponseTier || 'Tier 1 - Local';

    // Log escalation
    await db.query(`
      INSERT INTO TierEscalations 
      (DisasterID, FromTier, ToTier, EscalatedBy, Reason, AutoEscalation, Criteria)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [disasterId, fromTier, toTier, escalatedBy, reason, autoEscalation || false, reason]);

    // Update disaster tier
    let escalationHistory = disasters[0].EscalationHistory ? 
      JSON.parse(disasters[0].EscalationHistory) : [];
    
    escalationHistory.push({
      from: fromTier,
      to: toTier,
      timestamp: new Date(),
      reason,
      auto: autoEscalation || false
    });

    await db.query(
      'UPDATE Disasters SET ResponseTier = ?, EscalationHistory = ? WHERE DisasterID = ?',
      [toTier, JSON.stringify(escalationHistory), disasterId]
    );

    // Auto-activate tier resources
    await activateTierResources(disasterId, toTier);

    res.json({ 
      message: `Disaster escalated to ${toTier}`,
      from: fromTier,
      to: toTier
    });
  } catch (error) {
    console.error('Error escalating tier:', error);
    res.status(500).json({ message: 'Error escalating tier', error: error.message });
  }
};

// Get tier escalation history
exports.getEscalationHistory = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const [escalations] = await db.query(`
      SELECT * FROM TierEscalations 
      WHERE DisasterID = ?
      ORDER BY EscalatedAt DESC
    `, [disasterId]);

    res.json(escalations);
  } catch (error) {
    console.error('Error fetching escalation history:', error);
    res.status(500).json({ message: 'Error fetching escalation history', error: error.message });
  }
};

// Get tier resource deployments
exports.getTierDeployments = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const [deployments] = await db.query(`
      SELECT * FROM TierResourceDeployments 
      WHERE DisasterID = ?
      ORDER BY DeployedAt DESC
    `, [disasterId]);

    res.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({ message: 'Error fetching deployments', error: error.message });
  }
};

// Deploy tier resources
exports.deployTierResource = async (req, res) => {
  try {
    const { DisasterID, TierLevel, ResourceType, ResourceDescription, Quantity } = req.body;

    const [result] = await db.query(`
      INSERT INTO TierResourceDeployments 
      (DisasterID, TierLevel, ResourceType, ResourceDescription, Quantity)
      VALUES (?, ?, ?, ?, ?)
    `, [DisasterID, TierLevel, ResourceType, ResourceDescription, Quantity]);

    res.status(201).json({
      message: 'Tier resource deployed successfully',
      deploymentId: result.insertId
    });
  } catch (error) {
    console.error('Error deploying tier resource:', error);
    res.status(500).json({ message: 'Error deploying tier resource', error: error.message });
  }
};

// Get tier statistics (dashboard view)
exports.getTierStatistics = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        ResponseTier,
        COUNT(*) as Count,
        SUM(EstimatedAffectedPopulation) as TotalAffected,
        SUM(EstimatedDamage) as TotalDamage
      FROM Disasters
      WHERE Status = 'Active'
      GROUP BY ResponseTier
      ORDER BY 
        CASE ResponseTier
          WHEN 'Tier 4 - International' THEN 1
          WHEN 'Tier 3 - National' THEN 2
          WHEN 'Tier 2 - Regional' THEN 3
          WHEN 'Tier 1 - Local' THEN 4
        END
    `);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching tier statistics:', error);
    res.status(500).json({ message: 'Error fetching tier statistics', error: error.message });
  }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function calculateRecommendedTier(disaster) {
  const affectedPop = disaster.EstimatedAffectedPopulation || 0;
  const damage = disaster.EstimatedDamage || 0;
  const criteria = [];
  let tier = 'Tier 1 - Local';
  let reasoning = [];

  // Tier 4 - International
  if (affectedPop > 100000 || damage > 5000000000) {
    tier = 'Tier 4 - International';
    reasoning.push('Catastrophic scale exceeding national capacity');
    if (affectedPop > 100000) criteria.push(`Affected: ${affectedPop.toLocaleString()}`);
    if (damage > 5000000000) criteria.push(`Damage: ฿${(damage/1000000000).toFixed(1)}B`);
  }
  // Tier 3 - National
  else if (affectedPop > 50000 || damage > 500000000) {
    tier = 'Tier 3 - National';
    reasoning.push('Multi-province disaster requiring national coordination');
    if (affectedPop > 50000) criteria.push(`Affected: ${affectedPop.toLocaleString()}`);
    if (damage > 500000000) criteria.push(`Damage: ฿${(damage/1000000).toFixed(0)}M`);
  }
  // Tier 2 - Regional
  else if (affectedPop > 5000 || damage > 50000000) {
    tier = 'Tier 2 - Regional';
    reasoning.push('Multi-district disaster requiring regional resources');
    if (affectedPop > 5000) criteria.push(`Affected: ${affectedPop.toLocaleString()}`);
    if (damage > 50000000) criteria.push(`Damage: ฿${(damage/1000000).toFixed(0)}M`);
  }
  // Tier 1 - Local
  else {
    tier = 'Tier 1 - Local';
    reasoning.push('Localized incident manageable with district resources');
  }

  // Check capacity alerts for additional escalation
  const [alerts] = await db.query(`
    SELECT COUNT(*) as CriticalAlerts
    FROM CapacityAlerts
    WHERE DisasterID = ? AND Severity IN ('High', 'Critical') AND Status = 'Active'
  `, [disaster.DisasterID]);

  if (alerts[0]?.CriticalAlerts > 2) {
    const currentTierLevel = parseInt(tier.split(' ')[1]);
    if (currentTierLevel < 4) {
      const newTierLevel = currentTierLevel + 1;
      tier = `Tier ${newTierLevel} - ${getTierName(newTierLevel)}`;
      reasoning.push(`Escalated due to ${alerts[0].CriticalAlerts} critical capacity alerts`);
      criteria.push(`${alerts[0].CriticalAlerts} critical alerts`);
    }
  }

  return { tier, criteria, reasoning };
}

function getTierName(level) {
  const names = { 1: 'Local', 2: 'Regional', 3: 'National', 4: 'International' };
  return names[level] || 'Local';
}

function shouldEscalate(current, recommended) {
  const tierLevels = {
    'Tier 1 - Local': 1,
    'Tier 2 - Regional': 2,
    'Tier 3 - National': 3,
    'Tier 4 - International': 4
  };

  return tierLevels[recommended] > tierLevels[current];
}

async function activateTierResources(disasterId, tier) {
  // Auto-deploy resources based on tier
  const tierLevel = parseInt(tier.split(' ')[1]);

  if (tierLevel >= 2) {
    // Regional resources
    await db.query(`
      INSERT INTO TierResourceDeployments 
      (DisasterID, TierLevel, ResourceType, ResourceDescription, Status)
      VALUES 
      (?, 2, 'Provincial DDPM', 'Regional coordination team deployed', 'Deployed'),
      (?, 2, 'Mobile Units', 'Emergency response vehicles', 'Deployed')
    `, [disasterId, disasterId]);
  }

  if (tierLevel >= 3) {
    // National resources
    await db.query(`
      INSERT INTO TierResourceDeployments 
      (DisasterID, TierLevel, ResourceType, ResourceDescription, Status)
      VALUES 
      (?, 3, 'National DDPM', 'National command center activated', 'Deployed'),
      (?, 3, 'Military Support', 'Royal Thai Army civil affairs unit', 'Deployed'),
      (?, 3, 'Emergency Budget', 'National disaster relief fund allocated', 'Deployed')
    `, [disasterId, disasterId, disasterId]);
  }

  if (tierLevel >= 4) {
    // International resources
    await db.query(`
      INSERT INTO TierResourceDeployments 
      (DisasterID, TierLevel, ResourceType, ResourceDescription, Status)
      VALUES 
      (?, 4, 'UN OCHA', 'International humanitarian coordination', 'Deployed'),
      (?, 4, 'ASEAN AHA Centre', 'Regional disaster response mechanism', 'Deployed')
    `, [disasterId, disasterId]);
  }
}

// Bulk check all active disasters for tier escalation needs
exports.checkAllDisastersForEscalation = async (req, res) => {
  try {
    const [disasters] = await db.query(
      'SELECT DisasterID, ResponseTier FROM Disasters WHERE Status = "Active"'
    );

    const escalationRecommendations = [];

    for (const disaster of disasters) {
      const [fullDisaster] = await db.query(
        'SELECT * FROM Disasters WHERE DisasterID = ?',
        [disaster.DisasterID]
      );

      const recommended = await calculateRecommendedTier(fullDisaster[0]);
      const currentTier = disaster.ResponseTier || 'Tier 1 - Local';

      if (shouldEscalate(currentTier, recommended.tier)) {
        escalationRecommendations.push({
          disasterId: disaster.DisasterID,
          currentTier,
          recommendedTier: recommended.tier,
          reasoning: recommended.reasoning
        });
      }
    }

    res.json({
      totalChecked: disasters.length,
      escalationNeeded: escalationRecommendations.length,
      recommendations: escalationRecommendations
    });
  } catch (error) {
    console.error('Error checking escalations:', error);
    res.status(500).json({ message: 'Error checking escalations', error: error.message });
  }
};
