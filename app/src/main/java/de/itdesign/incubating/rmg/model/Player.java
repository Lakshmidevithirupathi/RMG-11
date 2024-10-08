package de.itdesign.incubating.rmg.model;

import java.util.List;

public record Player(String id, Role role, String name, List<Integer> scores) { }
