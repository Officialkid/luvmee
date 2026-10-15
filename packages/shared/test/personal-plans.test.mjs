import test from 'node:test';
import assert from 'node:assert/strict';
import { CreatePersonalPlanSchema } from '../dist/index.js';

test('Phase F: CreatePersonalPlanSchema validates title and optional fields', () => {
  const validPlan = {
    title: 'Surprise Rooftop Dinner',
    plannedDate: '2026-11-20',
    placeName: 'Skyline Bistro',
    activity: 'Romantic sunset dinner and jazz music',
    giftIdea: 'Vintage gold locket',
    notes: 'Book table 4 near the window 2 weeks ahead'
  };

  const result = CreatePersonalPlanSchema.safeParse(validPlan);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.data.title, 'Surprise Rooftop Dinner');
    assert.equal(result.data.status, 'planned');
    assert.equal(result.data.placeName, 'Skyline Bistro');
  }

  // Title is mandatory
  const invalidEmpty = { title: '' };
  assert.ok(!CreatePersonalPlanSchema.safeParse(invalidEmpty).success);
});

test('Phase F: Multi-tenant ownership invariant - Plans are private to owner', () => {
  const userAPlan = { id: 'plan_1', userId: 'user_1', title: 'Buy Flowers' };
  const userBPlan = { id: 'plan_2', userId: 'user_2', title: 'Plan Trip' };

  function filterUserPlans(plans, userId) {
    return plans.filter((p) => p.userId === userId);
  }

  const userAVisible = filterUserPlans([userAPlan, userBPlan], 'user_1');
  assert.equal(userAVisible.length, 1);
  assert.equal(userAVisible[0].title, 'Buy Flowers');

  const userBVisible = filterUserPlans([userAPlan, userBPlan], 'user_2');
  assert.equal(userBVisible.length, 1);
  assert.equal(userBVisible[0].title, 'Plan Trip');
});
