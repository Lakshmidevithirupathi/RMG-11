package de.itdesign.incubating.rmg.model;

import java.util.Collection;

public class ProjectPlan {
    String id;
    Player owner;
    Project project;
    int projectStartTime;
    Collection<ResourceCard> cards;
}
