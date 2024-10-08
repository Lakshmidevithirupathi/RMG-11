package de.itdesign.incubating.rmg.model;

import java.util.Collection;

public class Project {
    String id;
    final String name;
    final int initialStartTime, initialFinishTime;
    Collection<Demand> demands;

    public Project(String id, String name, int initialStartTime, int initialFinishTime, Collection<Demand> demands) {
        this.name = name;
        this.initialStartTime = initialStartTime;
        this.initialFinishTime = initialFinishTime;
        this.demands = demands;
    }
}
