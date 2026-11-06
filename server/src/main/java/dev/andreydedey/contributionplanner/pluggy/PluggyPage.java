package dev.andreydedey.contributionplanner.pluggy;

import java.util.List;

public record PluggyPage<T>(int page, int totalPages, List<T> results) {

}
