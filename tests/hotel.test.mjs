import assert from "node:assert/strict";
import { test } from "node:test";
import { createHotelRooms, defaultStay, evaluateStay, renderStayPlanner } from "../sites/hotel-experience.js";

const keys = ["roomBlue", "roomOchre", "roomSalon"];
const images = Object.fromEntries(keys.map(key => [key, {
  src: `${key}.jpg`, alt: key, credit: "Sample test credit",
}]));
const catalog = keys.map((image, index) => ({
  image, name: ["Blue Border Room", "Ochre Balcony Room", "River Salon Suite"][index],
  price: `from ${[168, 192, 236][index]} sample rate`, code: image, text: "Existing room facts",
}));
const rooms = createHotelRooms(catalog, images);

test("default stay uses existing sample rates and all three rooms", () => {
  const result = evaluateStay(rooms, defaultStay);
  assert.equal(result.ok, true);
  assert.equal(result.query.nights, 3);
  assert.deepEqual(result.results.map(room => room.total), [504, 576, 708]);
  assert.equal(result.query.weekendNights, 0);
  assert.match(renderStayPlanner(rooms), /not a reservation/);
});

test("date-based availability excludes overlapping nights, not checkout day", () => {
  const blocked = evaluateStay(rooms, { ...defaultStay, arrival: "2027-05-14", departure: "2027-05-16" });
  assert.deepEqual(blocked.results.map(room => room.id), ["roomOchre", "roomSalon"]);
  const checkoutOnBlockedDay = evaluateStay(rooms, {
    ...defaultStay, arrival: "2027-05-13", departure: "2027-05-14",
  });
  assert.ok(checkoutOnBlockedDay.results.some(room => room.id === "roomBlue"));
  assert.deepEqual(evaluateStay(rooms, {
    ...defaultStay, arrival: "2027-05-24", departure: "2027-05-25",
  }).results, []);
});

test("guest capacity and room-style filters genuinely change results", () => {
  assert.deepEqual(evaluateStay(rooms, { ...defaultStay, guests: "3" }).results.map(room => room.id), ["roomSalon"]);
  assert.deepEqual(evaluateStay(rooms, { ...defaultStay, style: "balcony" }).results.map(room => room.id), ["roomOchre"]);
  assert.deepEqual(evaluateStay(rooms, { ...defaultStay, guests: "3", style: "balcony" }).results, []);
});

test("Friday and Saturday surcharges are deterministic per occupied night", () => {
  const result = evaluateStay(rooms, { ...defaultStay, arrival: "2027-05-07", departure: "2027-05-10" });
  assert.equal(result.query.weekendNights, 2);
  assert.deepEqual(result.results.map(room => room.total), [552, 624, 756]);
  assert.deepEqual(evaluateStay(rooms, { ...defaultStay, arrival: "2027-05-07", departure: "2027-05-10" }), result);
});

test("invalid, reversed, overlong and out-of-calendar dates expose field errors", () => {
  for (const input of [
    { arrival: "" }, { arrival: "2027-02-30" }, { arrival: "2027-04-30" },
    { arrival: "2027-05-03", departure: "2027-05-03" },
    { arrival: "2027-05-06", departure: "2027-05-03" },
    { arrival: "2027-05-01", departure: "2027-05-16" },
    { departure: "2027-06-02" },
  ]) {
    const result = evaluateStay(rooms, { ...defaultStay, ...input });
    assert.equal(result.ok, false, JSON.stringify(input));
    assert.ok(result.errors.arrival || result.errors.departure);
    assert.equal(result.results, undefined);
  }
  assert.equal(evaluateStay(rooms, {
    ...defaultStay, arrival: "2027-05-31", departure: "2027-06-01",
  }).ok, true);
  assert.equal(evaluateStay(rooms, {
    ...defaultStay, arrival: "2027-05-01", departure: "2027-05-15",
  }).ok, true);
});

test("invalid guest counts and unknown filters are rejected explicitly", () => {
  for (const guests of ["", "0", "4", "2.5", "many", Infinity]) {
    assert.equal(evaluateStay(rooms, { ...defaultStay, guests }).ok, false);
    assert.ok(evaluateStay(rooms, { ...defaultStay, guests }).errors.guests);
  }
  assert.ok(evaluateStay(rooms, { ...defaultStay, style: "unknown" }).errors.style);
});

test("room preparation fails explicitly when incumbent data is incomplete", () => {
  assert.throws(() => createHotelRooms([{ ...catalog[0], price: "missing" }], images), /Missing sample room data/);
  assert.throws(() => createHotelRooms(catalog, {}), /Missing sample room data/);
});
