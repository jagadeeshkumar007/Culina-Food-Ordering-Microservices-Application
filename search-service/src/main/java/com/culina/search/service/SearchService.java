package com.culina.search.service;

import static co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders.multiMatch;

import java.util.Arrays;
import java.util.List;

import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.culina.search.document.MenuItemDocument;
import com.culina.search.dto.MenuItemResponse;

import co.elastic.clients.json.JsonData;

@Service
public class SearchService {

    private final ElasticsearchOperations operations;
    private final RestTemplate restTemplate;

    public SearchService(ElasticsearchOperations operations, RestTemplate restTemplate) {
        this.operations = operations;
        this.restTemplate = restTemplate;
    }

    public List<MenuItemDocument> search(String query) {

        NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(
                        multiMatch(m -> m
                                .query(query)
                                .fields("name^3", "description", "tags")))
                .build();

        return operations
                .search(searchQuery, MenuItemDocument.class)
                .stream()
                .map(SearchHit::getContent)
                .toList();
    }

    public List<MenuItemResponse> search(String query, Long minPrice, Long maxPrice) {
        NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> {
                    b.must(m -> m.multiMatch(mm -> mm
                            .query(query)
                            .fields("name^4", "tags^3", "description")
                            .fuzziness("AUTO")));

                    b.filter(f -> f.term(t -> t.field("isAvailable").value(true)));

                    if (minPrice != null || maxPrice != null) {
                        b.filter(f -> f.range(r -> {
                            r.field("priceCents");
                            if (minPrice != null)
                                r.gte(JsonData.of(minPrice));
                            if (maxPrice != null)
                                r.lte(JsonData.of(maxPrice));
                            return r;
                        }));
                    }
                    return b;
                }))
                .build();

        List<Long> orderedMenuItemIds = operations.search(searchQuery, MenuItemDocument.class)
                .stream()
                .map(SearchHit::getContent)
                .map(MenuItemDocument::getMenuItemId)
                .toList();

        if (orderedMenuItemIds.isEmpty()) {
            return List.of();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Wrap the body with headers
        HttpEntity<List<Long>> requestEntity = new HttpEntity<>(orderedMenuItemIds, headers);

        // Make the POST request
        ResponseEntity<MenuItemResponse[]> response = restTemplate.postForEntity(
                "http://culina-order:8081/chefs/menu/items/by-ids",
                requestEntity, // Use HttpEntity instead of raw list
                MenuItemResponse[].class);

        return Arrays.asList(response.getBody());
    }
}
