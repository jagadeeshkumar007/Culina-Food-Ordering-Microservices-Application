package com.culina.search.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.culina.search.dto.MenuItemResponse;
import com.culina.search.service.SearchService;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<MenuItemResponse> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") Long minPrice,
            @RequestParam(defaultValue = "10000000") Long maxPrice
    ) {
        return searchService.search(q, minPrice, maxPrice);
    }
}

